<?php
declare(strict_types=1);
if (!is_dir(__DIR__ . '/sessions')) mkdir(__DIR__ . '/sessions', 0700, true);
session_save_path(__DIR__ . '/sessions');
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function reply(mixed $data, int $code=200): never { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); exit; }
function body(): array { $v=json_decode(file_get_contents('php://input'),true); return is_array($v)?$v:$_POST; }
function db(): PDO {
  static $pdo;
  if (!$pdo) {
    $host=getenv('DB_HOST')?:'127.0.0.1'; $name=getenv('DB_NAME')?:'rental_bh_system';
    $user=getenv('DB_USER')?:'root'; $pass=getenv('DB_PASS')?:'';
    $pdo=new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    $statusColumn=$pdo->query("SHOW COLUMNS FROM users LIKE 'status'")->fetch();
    if(!$statusColumn)$pdo->exec("ALTER TABLE users ADD status ENUM('pending','active') NOT NULL DEFAULT 'active'");
  }
  return $pdo;
}
function currentUser(): array { if (empty($_SESSION['user'])) reply(['message'=>'Unauthenticated.'],401); return $_SESSION['user']; }
function allow(array $roles): array { $u=currentUser(); if(!in_array($u['role'],$roles,true)) reply(['message'=>'You do not have permission to do this.'],403); return $u; }
function failValidation(array $errors): never { reply(['message'=>'The submitted data is invalid.','errors'=>$errors],422); }

try {
  $pdo=db();
  $method=$_SERVER['REQUEST_METHOD'];
  $path=trim(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH)??'','/');
  $path=preg_replace('#^api/?#','',$path);
  $input=body();
  if($path==='login' && $method==='POST') {
    $q=$pdo->prepare('SELECT id,name,email,password,role,tenant_id,status FROM users WHERE email=?'); $q->execute([strtolower(trim($input['email']??''))]); $u=$q->fetch();
    if(!$u || !password_verify((string)($input['password']??''),$u['password'])) reply(['message'=>'Email or password is incorrect.'],422);
    if($u['status']!=='active')reply(['message'=>'Your account request is waiting for administrator approval.'],403);
    unset($u['password']); session_regenerate_id(true); $_SESSION['user']=$u; reply(['user'=>$u]);
  }
  if($path==='register' && $method==='POST') {
    $errors=[];foreach(['name','email','password','role'] as $field)if(trim((string)($input[$field]??''))==='')$errors[$field]=['This field is required.'];
    if(isset($input['email'])&&!filter_var($input['email'],FILTER_VALIDATE_EMAIL))$errors['email']=['Enter a valid email address.'];
    if(strlen((string)($input['password']??''))<8)$errors['password']=['Use at least 8 characters.'];
    if(!in_array($input['role']??'',['tenant','staff'],true))$errors['role']=['Only staff and tenant accounts can request access.'];
    if(($input['role']??'')==='tenant'&&trim((string)($input['contact_number']??''))==='')$errors['contact_number']=['This field is required for tenant accounts.'];
    if($errors)failValidation($errors);
    try{$pdo->beginTransaction();$tenantId=null;if($input['role']==='tenant'){$t=$pdo->prepare("INSERT INTO tenants(full_name,contact_number,email,emergency_contact,status) VALUES(?,?,?,?,'Active')");$t->execute([trim($input['name']),trim($input['contact_number']),strtolower(trim($input['email'])),trim((string)($input['emergency_contact']??''))?:null]);$tenantId=(int)$pdo->lastInsertId();}$q=$pdo->prepare("INSERT INTO users(name,email,password,role,tenant_id,status) VALUES(?,?,?,?,?,'pending')");$q->execute([trim($input['name']),strtolower(trim($input['email'])),password_hash($input['password'],PASSWORD_DEFAULT),$input['role'],$tenantId]);$userId=(int)$pdo->lastInsertId();if($tenantId){$link=$pdo->prepare('UPDATE tenants SET user_id=? WHERE id=?');$link->execute([$userId,$tenantId]);}$pdo->commit();reply(['message'=>'Account request submitted. An administrator must approve it before you can sign in.'],201);}catch(PDOException $e){if($pdo->inTransaction())$pdo->rollBack();if(str_contains($e->getMessage(),'Duplicate'))failValidation(['email'=>['An account already uses this email.']]);throw $e;}
  }
  if($path==='logout' && $method==='POST') { $_SESSION=[]; session_destroy(); reply(['message'=>'Signed out.']); }
  if($path==='me' && $method==='GET') reply(['user'=>currentUser()]);
  $user=currentUser();
  if($path==='notifications' && $method==='GET') {
    $counts=['account_requests'=>0,'maintenance'=>0,'tenant_updates'=>0];
    if($user['role']==='admin'){$counts['account_requests']=(int)$pdo->query("SELECT COUNT(*) FROM users WHERE status='pending'")->fetchColumn();$counts['maintenance']=(int)$pdo->query("SELECT COUNT(*) FROM maintenance_requests WHERE status='Pending'")->fetchColumn();}
    elseif($user['role']==='staff')$counts['maintenance']=(int)$pdo->query("SELECT COUNT(*) FROM maintenance_requests WHERE status='Pending'")->fetchColumn();
    elseif($user['role']==='tenant'&&!empty($user['tenant_id'])){$q=$pdo->prepare("SELECT COUNT(*) FROM maintenance_requests WHERE tenant_id=? AND status<>'Resolved'");$q->execute([$user['tenant_id']]);$counts['tenant_updates']=(int)$q->fetchColumn();$a=$pdo->prepare("SELECT id,monthly_rate,due_day FROM rental_agreements WHERE tenant_id=? AND status='Active' ORDER BY id DESC LIMIT 1");$a->execute([$user['tenant_id']]);$agreement=$a->fetch();if($agreement){$paid=$pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM payments WHERE rental_agreement_id=? AND payment_period=?');$paid->execute([$agreement['id'],date('Y-m')]);$balance=max(0,(float)$agreement['monthly_rate']-(float)$paid->fetchColumn());if($balance>0&&(int)date('j')>(int)$agreement['due_day'])$counts['tenant_updates']++;}}
    reply($counts);
  }
  if($path==='tenant-portal' && $method==='GET') {
    allow(['tenant']);
    if(empty($user['tenant_id']))reply(['message'=>'This tenant account is not linked to a tenant record. Ask the administrator to link it.'],422);
    $t=$pdo->prepare('SELECT id,full_name,email,contact_number FROM tenants WHERE id=?');$t->execute([$user['tenant_id']]);$tenant=$t->fetch();if(!$tenant)reply(['message'=>'Tenant record not found.'],404);
    $a=$pdo->prepare("SELECT a.id agreement_id,a.move_in_date,a.move_out_date,a.monthly_rate,a.due_day,a.status agreement_status,r.room_number,r.floor,r.room_type,r.capacity,r.status room_status,r.description FROM rental_agreements a JOIN rooms r ON r.id=a.room_id WHERE a.tenant_id=? ORDER BY a.id DESC LIMIT 1");$a->execute([$tenant['id']]);$agreement=$a->fetch();
    if($agreement){$period=date('Y-m');$p=$pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM payments WHERE rental_agreement_id=? AND payment_period=?');$p->execute([$agreement['agreement_id'],$period]);$agreement['payment_period']=$period;$agreement['paid_this_period']=(float)$p->fetchColumn();$agreement['balance']=max(0,(float)$agreement['monthly_rate']-$agreement['paid_this_period']);$agreement['due_date']=date('Y-m-').str_pad((string)min((int)$agreement['due_day'],(int)date('t')),2,'0',STR_PAD_LEFT);}
    $p=$pdo->prepare('SELECT p.id,p.amount,p.payment_date,p.payment_period,p.payment_method,p.reference_number FROM payments p JOIN rental_agreements a ON a.id=p.rental_agreement_id WHERE a.tenant_id=? ORDER BY p.payment_date DESC LIMIT 100');$p->execute([$tenant['id']]);$payments=$p->fetchAll();
    $m=$pdo->prepare('SELECT m.id,m.title,m.description,m.priority,m.status,m.submitted_at,m.resolved_at,r.room_number FROM maintenance_requests m JOIN rooms r ON r.id=m.room_id WHERE m.tenant_id=? ORDER BY m.id DESC LIMIT 100');$m->execute([$tenant['id']]);$maintenance=$m->fetchAll();
    reply(['tenant'=>$tenant,'agreement'=>$agreement,'payments'=>$payments,'maintenance'=>$maintenance]);
  }
  if($path==='tenant-maintenance' && $method==='POST') {
    allow(['tenant']);if(empty($user['tenant_id']))reply(['message'=>'Tenant account is not linked.'],422);
    $errors=[];foreach(['title','description'] as $key)if(trim((string)($input[$key]??''))==='')$errors[$key]=['This field is required.'];
    if(!in_array($input['priority']??'Medium',['Low','Medium','High'],true))$errors['priority']=['Select a valid priority.'];if($errors)failValidation($errors);
    $room=$pdo->prepare('SELECT room_id FROM rental_agreements WHERE tenant_id=? ORDER BY id DESC LIMIT 1');$room->execute([$user['tenant_id']]);$roomId=$room->fetchColumn();if(!$roomId)reply(['message'=>'No room is linked to this tenant account.'],422);
    $q=$pdo->prepare("INSERT INTO maintenance_requests(room_id,tenant_id,title,description,priority,status,submitted_at) VALUES(?,?,?,?,?,'Pending',?)");$q->execute([$roomId,$user['tenant_id'],trim($input['title']),trim($input['description']),$input['priority']??'Medium',date('Y-m-d')]);$requestId=(int)$pdo->lastInsertId();$details=$pdo->prepare('SELECT r.room_number,t.full_name FROM rooms r JOIN tenants t ON t.id=? WHERE r.id=?');$details->execute([$user['tenant_id'],$roomId]);$labels=$details->fetch();$snapshot=$pdo->prepare('SELECT payload FROM property_snapshots WHERE owner_id=1');$snapshot->execute();$payload=$snapshot->fetchColumn();if($payload!==false){$data=json_decode($payload,true);if(is_array($data)){$data['maintenance']??=[];array_unshift($data['maintenance'],['id'=>$requestId,'room'=>$labels['room_number']??'','tenant'=>$labels['full_name']??'','title'=>trim($input['title']),'description'=>trim($input['description']),'priority'=>$input['priority']??'Medium','status'=>'Pending','submitted_at'=>date('Y-m-d'),'resolved_at'=>'']);$save=$pdo->prepare('UPDATE property_snapshots SET payload=? WHERE owner_id=1');$save->execute([json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)]);}}reply(['message'=>'Maintenance request submitted.'],201);
  }
  if($path==='dashboard' && $method==='GET') {
    allow(['admin','staff']);
    $period=$_GET['period']??date('Y-m');
    $rooms=(int)$pdo->query('SELECT COUNT(*) FROM rooms')->fetchColumn();
    $available=(int)$pdo->query("SELECT COUNT(*) FROM rooms WHERE status='Available'")->fetchColumn();
    $tenants=(int)$pdo->query("SELECT COUNT(*) FROM tenants WHERE status='Active'")->fetchColumn();
    $s=$pdo->prepare('SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_period=?');$s->execute([$period]);$collected=(float)$s->fetchColumn();
    $s=$pdo->prepare("SELECT a.id,a.tenant_id,t.full_name,a.room_id,r.room_number,a.monthly_rate,a.due_day,COALESCE(p.paid,0) paid FROM rental_agreements a JOIN tenants t ON t.id=a.tenant_id JOIN rooms r ON r.id=a.room_id LEFT JOIN (SELECT rental_agreement_id,payment_period,SUM(amount) paid FROM payments GROUP BY rental_agreement_id,payment_period) p ON p.rental_agreement_id=a.id AND p.payment_period=? WHERE a.status='Active'");$s->execute([$period]);$rows=$s->fetchAll();
    foreach($rows as &$row){$row['balance']=max(0,(float)$row['monthly_rate']-(float)$row['paid']);$row['overdue']=($row['balance']>0 && (int)date('j')>(int)$row['due_day']);} unset($row);
    reply(['period'=>$period,'total_rooms'=>$rooms,'available_rooms'=>$available,'occupied_rooms'=>$rooms-$available,'active_tenants'=>$tenants,'collected'=>$collected,'outstanding'=>array_sum(array_column($rows,'balance')),'balances'=>$rows]);
  }
  if($path==='snapshot' && $method==='GET') {
    allow(['admin','staff']);$q=$pdo->prepare('SELECT payload FROM property_snapshots WHERE owner_id=?');$q->execute([$user['role']==='staff'?1:$user['id']]);$value=$q->fetchColumn();reply(['data'=>$value===false?null:json_decode($value,true)]);
  }
  if($path==='snapshot' && $method==='PUT') {
    allow(['admin','staff']);if(!isset($input['data'])||!is_array($input['data']))failValidation(['data'=>['A valid property data object is required.']]);
    $json=json_encode($input['data'],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);$owner=$user['role']==='staff'?1:$user['id'];$q=$pdo->prepare('INSERT INTO property_snapshots(owner_id,payload) VALUES(?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)');$q->execute([$owner,$json]);reply(['message'=>'Property records saved.']);
  }
  $map=[
    'rooms'=>['table'=>'rooms','fields'=>['room_number','floor','room_type','capacity','monthly_rate','status','description']],
    'tenants'=>['table'=>'tenants','fields'=>['user_id','full_name','contact_number','email','emergency_contact','status']],
    'agreements'=>['table'=>'rental_agreements','fields'=>['tenant_id','room_id','move_in_date','move_out_date','monthly_rate','deposit_amount','due_day','status']],
    'payments'=>['table'=>'payments','fields'=>['rental_agreement_id','amount','payment_date','payment_period','payment_method','reference_number','notes']],
    'maintenance'=>['table'=>'maintenance_requests','fields'=>['room_id','tenant_id','title','description','priority','status','submitted_at','resolved_at']],
    'charges'=>['table'=>'rental_charges','fields'=>['rental_agreement_id','description','amount','due_date','status']],
    'users'=>['table'=>'users','fields'=>['name','email','password','role','tenant_id','status']],
  ];
  $parts=explode('/',$path);$entity=$parts[0]??'';$id=isset($parts[1])?(int)$parts[1]:null;
  if(!isset($map[$entity])) reply(['message'=>'Endpoint not found.'],404);
  if($entity==='users') allow(['admin']);
  elseif($method==='GET') allow(['admin','staff','tenant']);
  elseif($entity==='maintenance'&&$method==='POST') allow(['admin','staff']);
  else allow(['admin','staff']);
  $table=$map[$entity]['table'];$fields=$map[$entity]['fields'];
  if($method==='GET' && !$id) {
    $page=max(1,(int)($_GET['page']??1));$per=min(100,max(1,(int)($_GET['per_page']??10)));$offset=($page-1)*$per;
    $where=[];$args=[];
    if(isset($_GET['q']) && $_GET['q']!=='') { $searchFields=['rooms'=>['room_number','room_type','status'],'tenants'=>['full_name','contact_number','email'],'agreements'=>[],'payments'=>['payment_period','payment_method','reference_number'],'maintenance'=>['title','description','status','priority'],'charges'=>['description','status'],'users'=>['u.name','u.email','u.role']][$entity]??[]; if($searchFields){$where[]='('.implode(' OR ',array_map(fn($f)=>"$f LIKE ?",$searchFields)).')';foreach($searchFields as $_)$args[]='%'.$_GET['q'].'%';} }
    if(isset($_GET['status'])){$where[]='status=?';$args[]=$_GET['status'];}
    if($user['role']==='tenant') { if($entity==='tenants'){$where[]='user_id=?';$args[]=$user['id'];} elseif($entity==='agreements'){$where[]='tenant_id=?';$args[]=$user['tenant_id'];} elseif($entity==='payments'){$where[]='rental_agreement_id IN (SELECT id FROM rental_agreements WHERE tenant_id=?)';$args[]=$user['tenant_id'];} elseif($entity==='maintenance'){$where[]='tenant_id=?';$args[]=$user['tenant_id'];} else reply(['data'=>[],'meta'=>['current_page'=>1,'per_page'=>$per,'total'=>0,'last_page'=>1]]); }
    $sqlWhere=$where?' WHERE '.implode(' AND ',$where):'';$countBase=$entity==='users'?'SELECT COUNT(*) FROM users u LEFT JOIN tenants t ON t.id=u.tenant_id':'SELECT COUNT(*) FROM '.$table;$count=$pdo->prepare("$countBase$sqlWhere");$count->execute($args);$total=(int)$count->fetchColumn();
    $queryBase=$entity==='users'?'SELECT u.id,u.name,u.email,u.role,u.tenant_id,t.full_name tenant_name,u.status,u.created_at FROM users u LEFT JOIN tenants t ON t.id=u.tenant_id':'SELECT * FROM '.$table;
    $order=$entity==='users'?'u.id':'id';$q=$pdo->prepare("$queryBase$sqlWhere ORDER BY $order DESC LIMIT $per OFFSET $offset");$q->execute($args);$rows=$q->fetchAll();
    if($entity==='agreements') foreach($rows as &$r){$r['tenant']=$pdo->query('SELECT full_name FROM tenants WHERE id='.(int)$r['tenant_id'])->fetchColumn();$r['room']=$pdo->query('SELECT room_number FROM rooms WHERE id='.(int)$r['room_id'])->fetchColumn();} unset($r);
    reply(['data'=>$rows,'meta'=>['current_page'=>$page,'per_page'=>$per,'total'=>$total,'last_page'=>max(1,(int)ceil($total/$per))]]);
  }
  if($method==='GET' && $id){$select=$entity==='users'?'u.id,u.name,u.email,u.role,u.tenant_id,t.full_name tenant_name,u.status,u.created_at':'*';$sql=$entity==='users'?"SELECT $select FROM users u LEFT JOIN tenants t ON t.id=u.tenant_id WHERE u.id=?":"SELECT * FROM $table WHERE id=?";$args=[$id];if($user['role']==='tenant'){if($entity==='tenants'){$sql.=' AND user_id=?';$args[]=$user['id'];}elseif($entity==='agreements'){$sql.=' AND tenant_id=?';$args[]=$user['tenant_id'];}elseif($entity==='payments'){$sql.=' AND rental_agreement_id IN (SELECT id FROM rental_agreements WHERE tenant_id=?)';$args[]=$user['tenant_id'];}elseif($entity==='maintenance'){$sql.=' AND tenant_id=?';$args[]=$user['tenant_id'];}elseif($entity==='rooms'){$sql.=' AND id IN (SELECT room_id FROM rental_agreements WHERE tenant_id=?)';$args[]=$user['tenant_id'];}else reply(['message'=>'Record not found.'],404);}$q=$pdo->prepare($sql);$q->execute($args);$row=$q->fetch();if(!$row)reply(['message'=>'Record not found.'],404);reply(['data'=>$row]);}
  if($method==='DELETE' && $id){allow(['admin']);$q=$pdo->prepare("DELETE FROM $table WHERE id=?");$q->execute([$id]);reply(['message'=>'Record deleted.']);}
  if(in_array($method,['POST','PATCH'],true)) {
    if($method==='PATCH' && !$id)reply(['message'=>'Record id is required.'],400);
    $values=array_intersect_key($input,array_flip($fields));
    if($entity==='users' && isset($values['password']))$values['password']=password_hash($values['password'],PASSWORD_DEFAULT);
    $required=['rooms'=>['room_number','capacity','monthly_rate'],'tenants'=>['full_name','contact_number','email'],'agreements'=>['tenant_id','room_id','move_in_date','monthly_rate'],'payments'=>['rental_agreement_id','amount','payment_date','payment_period','payment_method'],'maintenance'=>['room_id','title','description'],'charges'=>['rental_agreement_id','description','amount','due_date'],'users'=>['name','email','password','role']][$entity];
    $errors=[];foreach($required as $f)if(($method==='POST'||array_key_exists($f,$input))&&!isset($input[$f]))$errors[$f]=['This field is required.'];
    foreach(['amount','monthly_rate','deposit_amount','capacity','floor','due_day'] as $n)if(isset($input[$n])&&(!is_numeric($input[$n])||$input[$n]<0))$errors[$n]=['Must be a non-negative number.'];
    if(isset($input['email'])&&!filter_var($input['email'],FILTER_VALIDATE_EMAIL))$errors['email']=['Enter a valid email address.'];
      if($entity==='users'){
      if(isset($input['role'])&&!in_array($input['role'],['admin','staff','tenant'],true))$errors['role']=['Select a valid account role.'];
      if(($input['role']??'')==='tenant'&&empty($input['tenant_id'])&&empty($input['contact_number']))$errors['contact_number']=['Add a phone number to create a linked tenant profile.'];
      if(!empty($input['tenant_id'])){$check=$pdo->prepare('SELECT id,user_id FROM tenants WHERE id=?');$check->execute([(int)$input['tenant_id']]);$linkedTenant=$check->fetch();if(!$linkedTenant&&empty($input['contact_number']))$errors['tenant_id']=['Select an existing tenant or provide a phone number to create a profile.'];elseif($linkedTenant&&!empty($linkedTenant['user_id']))$errors['tenant_id']=['This tenant already has a login account.'];}
      if(isset($input['password'])&&strlen((string)$input['password'])<8)$errors['password']=['Use at least 8 characters.'];
    }
    foreach(['move_in_date','move_out_date','payment_date','submitted_at','resolved_at','due_date'] as $dateField)if(!empty($input[$dateField])){$d=DateTime::createFromFormat('!Y-m-d',(string)$input[$dateField]);if(!$d||$d->format('Y-m-d')!==$input[$dateField])$errors[$dateField]=['Use a valid date in YYYY-MM-DD format.'];}
    if($errors)failValidation($errors);
    if($entity==='users'&&($values['role']??'')!=='tenant')unset($values['tenant_id']);
    if($entity==='maintenance'&&$method==='POST'&&$user['role']==='tenant'){$values['tenant_id']=$user['tenant_id'];$values['status']='Pending';$values['submitted_at']=date('Y-m-d');}
    if(!$values)reply(['message'=>'No editable fields were provided.'],422);
    try {
      if($method==='POST'){$pdo->beginTransaction();if($entity==='users'&&($values['role']??'')==='tenant'){$linked=false;if(!empty($values['tenant_id'])){$check=$pdo->prepare('SELECT id FROM tenants WHERE id=?');$check->execute([(int)$values['tenant_id']]);$linked=(bool)$check->fetchColumn();}if(!$linked){$tenant=$pdo->prepare("INSERT INTO tenants(full_name,contact_number,email,emergency_contact,status) VALUES(?,?,?,?,'Active')");$tenant->execute([$values['name'],$input['contact_number'],$values['email'],$input['emergency_contact']??null]);$values['tenant_id']=(int)$pdo->lastInsertId();}}$cols=array_keys($values);$sql="INSERT INTO $table (".implode(',',$cols).') VALUES ('.implode(',',array_fill(0,count($cols),'?')).')';$q=$pdo->prepare($sql);$q->execute(array_values($values));$newId=(int)$pdo->lastInsertId();if($entity==='users'&&($values['role']??'')==='tenant'&&!empty($values['tenant_id'])){$link=$pdo->prepare('UPDATE tenants SET user_id=? WHERE id=?');$link->execute([$newId,$values['tenant_id']]);}$pdo->commit();$safe=$values;if(isset($safe['password']))unset($safe['password']);if($entity==='users'&&!empty($values['tenant_id'])){$tn=$pdo->prepare('SELECT full_name FROM tenants WHERE id=?');$tn->execute([$values['tenant_id']]);$safe['tenant_name']=$tn->fetchColumn();}reply(['message'=>'Record created.','data'=>['id'=>$newId]+$safe],201);}
      $cols=array_keys($values);$sql='UPDATE '.$table.' SET '.implode(',',array_map(fn($c)=>"$c=?",$cols)).' WHERE id=?';$q=$pdo->prepare($sql);$q->execute([...array_values($values),$id]);reply(['message'=>'Record updated.']);
    } catch(PDOException $e){if(str_contains($e->getMessage(),'Duplicate'))failValidation(['record'=>['A record with these details already exists.']]);throw $e;}
  }
  reply(['message'=>'Method not allowed.'],405);
} catch(Throwable $e) { error_log((string)$e); reply(['message'=>'Server error. Check the API log and database configuration.'],500); }
