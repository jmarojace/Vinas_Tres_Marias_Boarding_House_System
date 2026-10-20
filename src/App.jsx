import { useEffect, useMemo, useState } from 'react'
import './App.css'

const initial = {
  rooms: [
    { id: 1, room_number: 'Room 1', floor: '1', room_type: 'Shared', capacity: 5, monthly_rate: 5500, status: 'Occupied', description: 'Ground floor · Shared bath' },
    { id: 2, room_number: 'Room 2', floor: '1', room_type: 'Shared', capacity: 4, monthly_rate: 7800, status: 'Available', description: 'Ground floor · Private balcony' },
    { id: 3, room_number: 'Room 3', floor: '2', room_type: 'Shared', capacity: 6, monthly_rate: 6000, status: 'Occupied', description: 'Second floor · Quiet corner' },
    { id: 4, room_number: 'Room 4', floor: '2', room_type: 'Shared', capacity: 4, monthly_rate: 4200, status: 'Under Maintenance', description: 'Second floor · Near common area' },
    { id: 5, room_number: 'Room 5', floor: '2', room_type: 'Shared', capacity: 6, monthly_rate: 8000, status: 'Reserved', description: 'Second floor · Ensuite bath' },
    { id: 6, room_number: 'Room 6', floor: '3', room_type: 'Shared', capacity: 5, monthly_rate: 6200, status: 'Available', description: 'Top floor · City view' },
    { id: 7, room_number: 'Room 7', floor: '3', room_type: 'Shared', capacity: 4, monthly_rate: 7600, status: 'Available', description: 'Top floor · Bright corner room' },
    { id: 8, room_number: 'Room 8', floor: '3', room_type: 'Shared', capacity: 6, monthly_rate: 6100, status: 'Available', description: 'Top floor · Near shared lounge' },
    { id: 9, room_number: 'Room 9', floor: '4', room_type: 'Shared', capacity: 5, monthly_rate: 8200, status: 'Available', description: 'Fourth floor · Private bath' },
    { id: 10, room_number: 'Room 10', floor: '4', room_type: 'Shared', capacity: 4, monthly_rate: 4500, status: 'Available', description: 'Fourth floor · Shared suite' },
  ],
  tenants: [
    { id: 1, full_name: 'Sofia Reyes', contact_number: '0917 555 0182', email: 'sofia.reyes@email.com', emergency_contact: 'Maria Reyes · 0918 222 1000', room: 'Room 1', move_in_date: '2026-01-12', move_out_date: '2026-12-31', status: 'Active' },
    { id: 2, full_name: 'Daniel Cruz', contact_number: '0920 555 0114', email: 'daniel.cruz@email.com', emergency_contact: 'Elena Cruz · 0917 323 4421', room: 'Room 3', move_in_date: '2026-03-01', move_out_date: '2027-02-28', status: 'Active' },
    { id: 3, full_name: 'Miguel Santos', contact_number: '0918 555 0199', email: 'miguel.santos@email.com', emergency_contact: 'Rosa Santos · 0920 617 2222', room: 'Room 5', move_in_date: '2026-11-01', move_out_date: '2027-10-31', status: 'Reserved' },
  ],
  payments: [
    { id: 1, tenant: 'Sofia Reyes', room: 'Room 1', amount: 5500, payment_date: '2026-10-02', payment_period: 'October 2026', payment_method: 'GCash', reference_number: 'GC-27104', status: 'Paid' },
    { id: 2, tenant: 'Daniel Cruz', room: 'Room 3', amount: 3000, payment_date: '2026-10-04', payment_period: 'October 2026', payment_method: 'Bank transfer', reference_number: 'BT-88310', status: 'Partial' },
    { id: 3, tenant: 'Sofia Reyes', room: 'Room 1', amount: 5500, payment_date: '2026-09-02', payment_period: 'September 2026', payment_method: 'Cash', reference_number: 'CS-10934', status: 'Paid' },
  ],
  maintenance: [
    { id: 1, room: 'Room 4', tenant: 'Miguel Santos', title: 'Leaking bathroom faucet', description: 'The faucet has been dripping since yesterday.', priority: 'High', status: 'In Progress', submitted_at: '2026-10-15', resolved_at: '' },
    { id: 2, room: 'Room 1', tenant: 'Sofia Reyes', title: 'Bedroom light not working', description: 'Ceiling light stopped working.', priority: 'Medium', status: 'Pending', submitted_at: '2026-10-18', resolved_at: '' },
    { id: 3, room: 'Room 3', tenant: 'Daniel Cruz', title: 'Window latch is loose', description: 'Please check the latch near the desk.', priority: 'Low', status: 'Resolved', submitted_at: '2026-10-10', resolved_at: '2026-10-12' },
  ],
  agreements: [
    { id: 1, tenant: 'Sofia Reyes', room: 'Room 1', move_in_date: '2026-01-12', move_out_date: '2026-12-31', monthly_rate: 5500, deposit_amount: 5500, status: 'Active' },
    { id: 2, tenant: 'Daniel Cruz', room: 'Room 3', move_in_date: '2026-03-01', move_out_date: '2027-02-28', monthly_rate: 6000, deposit_amount: 6000, status: 'Active' },
    { id: 3, tenant: 'Miguel Santos', room: 'Room 5', move_in_date: '2026-11-01', move_out_date: '2027-10-31', monthly_rate: 8000, deposit_amount: 8000, status: 'Reserved' },
  ],
}

const pages = [
  { id: 'Overview', icon: '⌂', label: 'Overview' },
  { id: 'Tenant Portal', icon: '♙', label: 'My home' },
  { id: 'Rooms', icon: '▦', label: 'Rooms' },
  { id: 'Tenants', icon: '♙', label: 'Tenants' },
  { id: 'Agreements', icon: '▤', label: 'Agreements' },
  { id: 'Payments', icon: '₱', label: 'Payments' },
  { id: 'Maintenance', icon: '⌁', label: 'Maintenance' },
  { id: 'Accounts', icon: '♧', label: 'User accounts' },
  { id: 'Reports', icon: '▥', label: 'Reports' },
  { id: 'Settings', icon: '⚙', label: 'Settings' },
]

const configs = {
  Rooms: { title: 'Room', fields: [['room_number', 'Room number'], ['floor', 'Floor'], ['room_type', 'Room type', 'select', ['Shared']], ['capacity', 'Capacity', 'select', ['4', '5', '6']], ['monthly_rate', 'Monthly rate', 'number'], ['status', 'Status', 'select', ['Available', 'Occupied', 'Reserved', 'Under Maintenance']], ['description', 'Description']] },
  Tenants: { title: 'Tenant', fields: [['full_name', 'Full name'], ['contact_number', 'Contact number'], ['email', 'Email', 'email'], ['emergency_contact', 'Emergency contact'], ['room', 'Room', 'select', ['Unassigned']], ['move_in_date', 'Move-in date', 'date'], ['move_out_date', 'Move-out date', 'date']] },
  Agreements: { title: 'Agreement', fields: [['tenant', 'Tenant', 'select', ['']], ['room', 'Room', 'select', ['']], ['move_in_date', 'Move-in date', 'date'], ['move_out_date', 'Move-out date', 'date'], ['monthly_rate', 'Monthly rate', 'number'], ['deposit_amount', 'Deposit amount', 'number'], ['status', 'Status', 'select', ['Active', 'Reserved', 'Ended']]] },
  Payments: { title: 'Payment', fields: [['tenant', 'Tenant', 'select', ['']], ['room', 'Room', 'select', ['']], ['amount', 'Amount', 'number'], ['payment_date', 'Payment date', 'date'], ['payment_period', 'Payment period'], ['payment_method', 'Payment method', 'select', ['Cash', 'GCash', 'Bank transfer']], ['reference_number', 'Reference number']] },
  Maintenance: { title: 'Maintenance request', fields: [['room', 'Room', 'select', ['']], ['tenant', 'Tenant', 'select', ['']], ['title', 'Issue title'], ['description', 'Description'], ['priority', 'Priority', 'select', ['Low', 'Medium', 'High']], ['status', 'Status', 'select', ['Pending', 'In Progress', 'Resolved']]] },
}

const money = value => `₱${Number(value || 0).toLocaleString('en-PH')}`
const today = new Date().toISOString().slice(0, 10)
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const roomNames = { '101': 'Room 1', '102': 'Room 2', '201': 'Room 3', '202': 'Room 4', '203': 'Room 5', '301': 'Room 6' }

function migrateRooms(saved) {
  const normalize = value => roomNames[value] || value
  const hadLegacyRooms = saved.rooms?.some(room => roomNames[room.room_number])
  const capacities = { 1: 5, 2: 4, 3: 6, 4: 4, 5: 6, 6: 5, 7: 4, 8: 6, 9: 5, 10: 4 }
  const rooms = (saved.rooms || initial.rooms).map(room => {
    const id = Number(String(normalize(room.room_number)).replace('Room ', '')) || room.id
    return { ...room, room_number: normalize(room.room_number), room_type: 'Shared', capacity: capacities[id] || 4 + (Number(room.id) % 3) }
  })
  if (hadLegacyRooms) for (const room of initial.rooms) if (room.id > 6 && !rooms.some(item => item.id === room.id)) rooms.push(room)
  return {
    ...saved,
    rooms,
    tenants: (saved.tenants || []).map(item => ({ ...item, room: normalize(item.room) })),
    agreements: (saved.agreements || []).map(item => ({ ...item, room: normalize(item.room) })),
    payments: (saved.payments || []).map(item => ({ ...item, room: normalize(item.room) })),
    maintenance: (saved.maintenance || []).map(item => ({ ...item, room: normalize(item.room) })),
  }
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('tenant')
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async event => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (mode === 'register') {
        if (password !== confirmPassword) throw new Error('The passwords do not match.')
        const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, email, password, role, contact_number: contactNumber, emergency_contact: emergencyContact }) })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Could not submit your account request.')
        setMode('login')
        setSuccess(result.message || 'Your request was sent. Wait for the administrator to approve it before signing in.')
        setPassword('')
        setConfirmPassword('')
        return
      }
      const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Sign in failed.')
      onLogin(result.user)
    } catch (failure) {
      setError(failure.message || 'Could not reach the local API. Start the backend and try again.')
    }
  }

  return <main className="login-page"><div className="login-glow login-glow-one" /><div className="login-glow login-glow-two" /><section className="login-showcase"><div className="login-brand"><div className="brand-mark"><span>V</span></div><div><strong>Vinas Tres Marias</strong><small>BOARDING HOUSE</small></div></div><div className="showcase-copy"><span className="showcase-kicker"><span /> A LOVELY PLACE TO CALL HOME</span><h1>Welcome to a<br /><em>better way</em> to stay.</h1><p>Thoughtful spaces, caring service, and a home away from home. Manage your boarding house with a little more ease.</p><div className="showcase-illustration"><div className="sun-orb" /><div className="house-shadow" /><div className="house-art"><div className="roof-art" /><div className="house-front"><span className="window window-left" /><span className="window window-right" /><span className="door-art" /><span className="house-plant plant-one">✿</span><span className="house-plant plant-two">✿</span></div><div className="house-side" /></div><div className="flower flower-one">✿</div><div className="flower flower-two">✿</div><div className="floating-note"><span>✦</span><div><strong>A place to feel at home</strong><small>Vinas Tres Marias</small></div></div></div></div><footer className="login-footer">© 2026 Vinas Tres Marias Boarding House</footer></section><section className="login-form-side"><div className="login-form-wrap"><div className="mobile-login-brand"><div className="brand-mark"><span>V</span></div><div><strong>Vinas Tres Marias</strong><small>BOARDING HOUSE</small></div></div><div className="login-welcome"><div className="welcome-spark">✦</div><span className="form-eyebrow">PROPERTY MANAGEMENT</span><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to access your boarding house account.' : 'Send an account request to the property administrator.'}</p></div><form className="login-form" onSubmit={submit}>{mode === 'register' && <><label><span>Full name</span><div className="login-input-wrap"><input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required /></div></label><label><span>Account type</span><div className="login-input-wrap"><select value={role} onChange={event => setRole(event.target.value)}><option value="tenant">Tenant</option><option value="staff">Staff / Caretaker</option></select></div></label>{role === 'tenant' && <><label><span>Contact number</span><div className="login-input-wrap"><input type="tel" value={contactNumber} onChange={event => setContactNumber(event.target.value)} required /></div></label><label><span>Emergency contact (optional)</span><div className="login-input-wrap"><input value={emergencyContact} onChange={event => setEmergencyContact(event.target.value)} /></div></label></>}</>}<label><span>Email address</span><div className="login-input-wrap"><span className="input-symbol">✉</span><input type="email" value={email} onChange={event => { setEmail(event.target.value); setError(''); setSuccess('') }} placeholder="you@example.com" autoComplete="username" required /></div></label><label><span>Password{mode === 'register' && ' (8 characters minimum)'}</span><div className="login-input-wrap"><span className="input-symbol">♙</span><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => { setPassword(event.target.value); setError('') }} placeholder="Enter your password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 8 : undefined} required /><button type="button" className="show-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{mode === 'register' && <label><span>Confirm password</span><div className="login-input-wrap"><input type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></div></label>}{error && <div className="login-error">{error}</div>}{success && <div className="register-success">{success}</div>}{mode === 'login' && <div className="login-options"><label className="remember-option"><input type="checkbox" /> <span>Remember me</span></label><span>Role-based access</span></div>}<button className="login-submit" type="submit">{mode === 'login' ? 'Sign in' : 'Request account'} <span>→</span></button><button type="button" className="register-toggle" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}>{mode === 'login' ? 'New staff or tenant? Create an account' : 'Already have an account? Sign in'}</button>{mode === 'login' && <div className="login-help"><span>✧</span> Staff and tenant requests need administrator approval.</div>}</form><div className="login-lower"><span>PRIVATE PROPERTY PORTAL</span><span>Made with care <b>♥</b></span></div></div></section></main>
}

function TenantPortalView({ portal, error }) {
  if (error) return <section className="panel portal-message"><h1>Tenant home</h1><p>{error}</p><span>Ask the property administrator to connect your login to your tenant record.</span></section>
  if (!portal) return <section className="panel portal-message"><h1>Tenant home</h1><p>Loading your rental information…</p></section>
  const agreement = portal.agreement
  return <>
    <div className="page-heading"><div><div className="eyebrow">TENANT SELF SERVICE</div><h1>Welcome, {portal.tenant.full_name}</h1><p>Your room, rent, and payment information.</p></div></div>
    <section className="stats-grid portal-stats"><StatCard icon="▦" tone="violet" label="Your room" value={agreement?.room_number || 'Not assigned'} note={agreement ? `${agreement.room_type} · Floor ${agreement.floor}` : 'Contact the property owner'} trend="⌂" /><StatCard icon="₱" tone="green" label="Monthly rent" value={money(agreement?.monthly_rate)} note={agreement?.agreement_status || 'No active agreement'} trend="₱" /><StatCard icon="◷" tone="amber" label="Current balance" value={money(agreement?.balance)} note={agreement ? `Due ${dateLabel(agreement.due_date)}` : 'No balance due'} trend="!" /></section>
    <section className="panel portal-detail"><div className="panel-heading"><div><h2>Rental details</h2><p>Current agreement and room assignment</p></div><Status value={agreement?.agreement_status || 'Ended'} /></div>{agreement ? <div className="portal-detail-grid"><div><span>Room</span><strong>{agreement.room_number}</strong></div><div><span>Move in</span><strong>{dateLabel(agreement.move_in_date)}</strong></div><div><span>Lease ends</span><strong>{dateLabel(agreement.move_out_date)}</strong></div><div><span>Paid this month</span><strong>{money(agreement.paid_this_period)}</strong></div><div><span>Payment period</span><strong>{agreement.payment_period}</strong></div><div><span>Contact</span><strong>{portal.tenant.contact_number}</strong></div></div> : <p>No rental agreement is currently linked to your account.</p>}</section>
    <section className="panel table-panel portal-history"><div className="panel-heading"><div><h2>Payment history</h2><p>Your recent recorded payments</p></div></div><div className="table-scroll"><table><thead><tr><th>PERIOD</th><th>DATE</th><th>AMOUNT</th><th>METHOD</th><th>REFERENCE</th></tr></thead><tbody>{portal.payments.map(payment => <tr key={payment.id}><td>{payment.payment_period}</td><td>{dateLabel(payment.payment_date)}</td><td>{money(payment.amount)}</td><td>{payment.payment_method}</td><td>{payment.reference_number || '—'}</td></tr>)}</tbody></table>{portal.payments.length === 0 && <div className="empty-state"><strong>No payments recorded yet</strong></div>}</div></section>
    <section className="panel table-panel portal-history"><div className="panel-heading"><div><h2>Maintenance requests</h2><p>Issues you have submitted</p></div></div><div className="table-scroll"><table><thead><tr><th>ISSUE</th><th>ROOM</th><th>PRIORITY</th><th>SUBMITTED</th><th>STATUS</th></tr></thead><tbody>{portal.maintenance.map(request => <tr key={request.id}><td>{request.title}</td><td>{request.room_number}</td><td>{request.priority}</td><td>{dateLabel(request.submitted_at)}</td><td><Status value={request.status} /></td></tr>)}</tbody></table>{portal.maintenance.length === 0 && <div className="empty-state"><strong>No maintenance requests</strong></div>}</div></section>
  </>
}

function TenantMaintenanceView({ portal, error, onSubmit }) {
  return <>
    <div className="page-heading"><div><div className="eyebrow">TENANT SELF SERVICE</div><h1>Maintenance</h1><p>Send a repair request to the property staff.</p></div></div>
    {error && <div className="panel portal-message"><p>{error}</p></div>}
    <section className="panel tenant-request-panel"><div className="panel-heading"><div><h2>Submit a request</h2><p>{portal?.agreement?.room_number ? `For ${portal.agreement.room_number}` : 'Your room must be linked by the administrator.'}</p></div></div><form className="tenant-request-form" onSubmit={onSubmit}><label className="field"><span>Issue title</span><input name="title" required maxLength="190" /></label><label className="field"><span>Priority</span><select name="priority" defaultValue="Medium"><option>Low</option><option>Medium</option><option>High</option></select></label><label className="field request-description"><span>Description</span><textarea name="description" rows="4" required /></label><button className="button button-primary" type="submit" disabled={!portal?.agreement}>Submit request</button></form></section>
    <section className="panel table-panel portal-history"><div className="panel-heading"><div><h2>Your requests</h2><p>Track progress here</p></div></div><div className="table-scroll"><table><thead><tr><th>ISSUE</th><th>PRIORITY</th><th>SUBMITTED</th><th>STATUS</th></tr></thead><tbody>{(portal?.maintenance || []).map(request => <tr key={request.id}><td>{request.title}<small className="block-small">{request.description}</small></td><td>{request.priority}</td><td>{dateLabel(request.submitted_at)}</td><td><Status value={request.status} /></td></tr>)}</tbody></table></div></section>
  </>
}

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [snapshotLoaded, setSnapshotLoaded] = useState(false)
  const [preferences, setPreferences] = useState(() => {
    try { return { theme: 'light', compactTables: false, maintenanceReminders: true, ...JSON.parse(localStorage.getItem('vinas-bh-preferences') || '{}') } } catch { return { theme: 'light', compactTables: false, maintenanceReminders: true } }
  })
  const [data, setData] = useState(() => {
    try { return migrateRooms({ ...initial, ...JSON.parse(localStorage.getItem('rental-bh-data') || '{}') }) } catch { return initial }
  })
  const [page, setPage] = useState('Overview')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [tenantPortal, setTenantPortal] = useState(null)
  const [portalError, setPortalError] = useState('')
  const [userAccounts, setUserAccounts] = useState([])
  const [notificationCounts, setNotificationCounts] = useState({ account_requests: 0, maintenance: 0, tenant_updates: 0 })

  useEffect(() => {
    let active = true
    fetch('/api/me', { credentials: 'include' }).then(response => response.ok ? response.json() : null).then(result => {
      if (active && result?.user) { setCurrentUser(result.user); setPage(result.user.role === 'tenant' ? 'Tenant Portal' : 'Overview'); setAuthenticated(true) }
    }).catch(() => {}).finally(() => { if (active) setSessionLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!authenticated) return
    let active = true
    const refresh = () => fetch('/api/notifications', { credentials: 'include' }).then(response => response.ok ? response.json() : null).then(counts => { if (active && counts) setNotificationCounts(counts) }).catch(() => {})
    refresh()
    const timer = window.setInterval(refresh, 30000)
    return () => { active = false; window.clearInterval(timer) }
  }, [authenticated, currentUser])

  useEffect(() => {
    if (!authenticated || snapshotLoaded || !currentUser) return
    if (currentUser.role === 'tenant') return
    fetch('/api/snapshot', { credentials: 'include' }).then(async response => {
      if (!response.ok) throw new Error('Could not load shared property records.')
      return response.json()
    }).then(result => {
      if (result.data) {
        const migrated = migrateRooms({ ...initial, ...result.data })
        setData(migrated)
        localStorage.setItem('rental-bh-data', JSON.stringify(migrated))
      } else {
        fetch('/api/snapshot', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ data }) }).catch(() => {})
      }
      setSnapshotLoaded(true)
    }).catch(() => { setSnapshotLoaded(true); notify('Using the local copy; shared storage is unavailable.') })
  }, [authenticated, snapshotLoaded, data, currentUser])

  useEffect(() => {
    if (!authenticated || !['admin', 'staff'].includes(currentUser?.role) || page !== 'Maintenance') return
    fetch('/api/snapshot', { credentials: 'include' }).then(response => response.ok ? response.json() : null).then(result => {
      if (result?.data) { const migrated = migrateRooms({ ...initial, ...result.data }); setData(migrated); localStorage.setItem('rental-bh-data', JSON.stringify(migrated)) }
    }).catch(() => {})
  }, [authenticated, currentUser?.role, page])

  useEffect(() => {
    if (!authenticated || !currentUser) return
    if (currentUser.role === 'tenant' && ['Tenant Portal', 'Maintenance'].includes(page)) {
      fetch('/api/tenant-portal', { credentials: 'include' }).then(async response => {
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Could not load tenant information.')
        return result
      }).then(result => { setTenantPortal(result); setPortalError('') }).catch(error => setPortalError(error.message))
    }
    if (currentUser.role === 'admin' && page === 'Accounts') {
      fetch('/api/users?per_page=100', { credentials: 'include' }).then(response => response.json()).then(result => setUserAccounts(result.data || [])).catch(() => notify('Could not load user accounts.'))
    }
  }, [authenticated, currentUser, page])

  function notify(message) { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }
  const signOut = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    setCurrentUser(null)
    setSnapshotLoaded(false)
    setTenantPortal(null)
    setNotificationCounts({ account_requests: 0, maintenance: 0, tenant_updates: 0 })
    setAuthenticated(false)
    setPage('Overview')
  }
  const saveData = next => {
    setData(next)
    localStorage.setItem('rental-bh-data', JSON.stringify(next))
    if (authenticated) fetch('/api/snapshot', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ data: next }) }).then(response => { if (!response.ok) throw new Error('Save failed') }).catch(() => notify('Saved on this device; MySQL sync failed.'))
  }
  const updatePreferences = changes => setPreferences(current => {
    const next = { ...current, ...changes }
    localStorage.setItem('vinas-bh-preferences', JSON.stringify(next))
    return next
  })
  const activeTenants = data.tenants.filter(item => item.status === 'Active').length
  const available = data.rooms.filter(item => item.status === 'Available').length
  const collected = data.payments.filter(item => item.payment_period === 'October 2026').reduce((sum, item) => sum + Number(item.amount), 0)
  const overdue = Math.max(0, data.tenants.filter(item => item.status === 'Active').reduce((sum, item) => sum + (Number(data.rooms.find(room => room.room_number === item.room)?.monthly_rate) || 0), 0) - collected)

  const tableRows = useMemo(() => {
    const rows = data[page.toLowerCase()] || []
    return rows.filter(row => {
      const text = Object.values(row).join(' ').toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const status = row.status || 'All'
      const matchesFilter = filter === 'All' || status === filter
      return matchesQuery && matchesFilter
    })
  }, [data, page, query, filter])

  const removeRow = row => {
    if (!window.confirm(`Delete this ${configs[page].title.toLowerCase()} record?`)) return
    if (page === 'Maintenance' && currentUser?.role === 'admin') fetch(`/api/maintenance/${row.id}`, { method: 'DELETE', credentials: 'include' }).catch(() => {})
    saveData({ ...data, [page.toLowerCase()]: data[page.toLowerCase()].filter(item => item.id !== row.id) })
    notify('Record deleted')
  }

  const submitRecord = event => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const entry = Object.fromEntries(form.entries())
    const activeModalPage = modal.targetPage || page
    if (!entry.id) entry.id = Date.now()
    if (activeModalPage === 'Tenants') entry.status = modal.record?.status || 'Active'
    if (activeModalPage === 'Payments') entry.status = 'Paid'
    if (['amount', 'monthly_rate', 'deposit_amount', 'capacity', 'floor'].some(key => key in entry)) {
      for (const key of ['amount', 'monthly_rate', 'deposit_amount', 'capacity', 'floor']) if (key in entry) entry[key] = Number(entry[key])
    }
    const collection = activeModalPage.toLowerCase()
    const list = data[collection]
    const nextList = modal.record ? list.map(item => item.id === modal.record.id ? entry : item) : [entry, ...list]
    let next = { ...data, [collection]: nextList }
    if (activeModalPage === 'Tenants' && entry.room) next.rooms = next.rooms.map(room => room.room_number === entry.room ? { ...room, status: entry.status || 'Occupied' } : room)
    if (activeModalPage === 'Maintenance' && entry.status === 'Resolved') entry.resolved_at = today
    saveData(next)
    setModal(null)
    notify(modal.record ? 'Changes saved' : `${configs[activeModalPage].title} added`)
  }

  const openAdd = (targetPage = page) => {
    if (typeof targetPage !== 'string') targetPage = page
    if (targetPage !== page) setPage(targetPage)
    const seed = {}
    if (targetPage === 'Tenants') seed.status = 'Active'
    if (targetPage === 'Maintenance') { seed.status = 'Pending'; seed.priority = 'Medium' }
    if (targetPage === 'Agreements') seed.status = 'Active'
    if (targetPage === 'Payments') { seed.payment_date = today; seed.payment_period = 'October 2026' }
    setModal({ record: null, seed, targetPage })
  }

  const csvExport = () => {
    const list = data.tenants.map(tenant => ({ tenant: tenant.full_name, room: tenant.room, rate: data.rooms.find(room => room.room_number === tenant.room)?.monthly_rate || 0, status: tenant.status }))
    const csv = ['Tenant,Room,Monthly rate,Status', ...list.map(row => [row.tenant, row.room, row.rate, row.status].join(','))].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'boarding-house-report.csv'
    link.click()
    URL.revokeObjectURL(link.href)
    notify('Report downloaded')
  }

  const renderField = ([key, label, type, options = []], index) => {
    const activeModalPage = modal.targetPage || page
    let choices = options
    if (key === 'room' && ['Tenants', 'Agreements', 'Payments', 'Maintenance'].includes(activeModalPage)) choices = ['Unassigned', ...data.rooms.map(room => room.room_number)]
    if (key === 'tenant') choices = data.tenants.map(tenant => tenant.full_name)
    const value = modal.record?.[key] ?? modal.seed?.[key] ?? (type === 'select' && choices.length ? choices[0] : '')
    return <label className="field" key={key}><span>{label}</span>{type === 'select' ? <select name={key} defaultValue={value} required={key !== 'emergency_contact' && key !== 'description'}>{choices.map(option => <option key={option} value={option}>{option || 'Select tenant'}</option>)}</select> : key === 'description' ? <textarea name={key} rows="3" defaultValue={value} required={activeModalPage === 'Maintenance'} /> : <input name={key} type={type || 'text'} defaultValue={value} required={!['emergency_contact', 'reference_number', 'description'].includes(key)} min={type === 'number' ? '0' : undefined} />}{index === 0 && key === 'room' && activeModalPage === 'Tenants' && <small>Choose Unassigned if no room has been assigned yet.</small>}</label>
  }

  const appLoading = sessionLoading || (authenticated && currentUser?.role !== 'tenant' && !snapshotLoaded)
  if (appLoading) return <main className="session-loading" aria-live="polite"><div className="session-loading-card"><div className="brand-mark"><span>V</span></div><span className="session-loading-spinner" aria-hidden="true" /><p>{sessionLoading ? 'Checking your session…' : 'Loading your property…'}</p></div></main>
  if (!authenticated) return <Login onLogin={user => { setCurrentUser(user); setPage(user.role === 'tenant' ? 'Tenant Portal' : 'Overview'); setSnapshotLoaded(false); setAuthenticated(true) }} />

  const visiblePages = currentUser?.role === 'admin'
    ? pages.filter(item => item.id !== 'Tenant Portal')
    : currentUser?.role === 'staff'
      ? pages.filter(item => ['Overview', 'Rooms', 'Tenants', 'Payments', 'Maintenance'].includes(item.id))
      : pages.filter(item => ['Tenant Portal', 'Maintenance'].includes(item.id))
  const notificationTotal = currentUser?.role === 'admin'
    ? notificationCounts.account_requests + Math.max(notificationCounts.maintenance, data.maintenance.filter(row => row.status === 'Pending').length)
    : currentUser?.role === 'staff' ? Math.max(notificationCounts.maintenance, data.maintenance.filter(row => row.status === 'Pending').length) : notificationCounts.tenant_updates
  const maintenanceBadgeCount = Math.max(notificationCounts.maintenance, data.maintenance.filter(row => row.status === 'Pending').length)
  const notificationTarget = currentUser?.role === 'admin'
    ? notificationCounts.account_requests > 0 ? 'Accounts' : 'Maintenance'
    : currentUser?.role === 'tenant' ? 'Tenant Portal' : 'Maintenance'
  const greetingName = currentUser?.name?.trim().split(/\s+/)[0] || 'there'
  const createAccount = async event => {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const account = Object.fromEntries(form.entries())
    if (!account.tenant_id) delete account.tenant_id
    try {
      const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(account) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || Object.values(result.errors || {}).flat().join(' '))
      setUserAccounts(current => [result.data, ...current])
      formElement.reset()
      notify('Account created')
    } catch (error) { notify(error.message) }
  }
  const approveAccount = async account => {
    try {
      const response = await fetch(`/api/users/${account.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status: 'active' }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not approve account.')
      setUserAccounts(accounts => accounts.map(item => item.id === account.id ? { ...item, status: 'active' } : item))
      setNotificationCounts(counts => ({ ...counts, account_requests: Math.max(0, counts.account_requests - 1) }))
      notify(`${account.name} approved`)
    } catch (error) { notify(error.message) }
  }
  const submitTenantMaintenance = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form).entries())
    try {
      const response = await fetch('/api/tenant-maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not submit request.')
      form.reset()
      notify('Maintenance request submitted')
      setNotificationCounts(counts => ({ ...counts, tenant_updates: counts.tenant_updates + 1 }))
      const refresh = await fetch('/api/tenant-portal', { credentials: 'include' })
      if (refresh.ok) setTenantPortal(await refresh.json())
    } catch (error) { notify(error.message) }
  }

  return <div className={`app-shell ${preferences.theme === 'dark' ? 'theme-dark' : ''} ${preferences.compactTables ? 'compact-tables' : ''}`}>
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><span>V</span></div><div><strong>Vinas Tres Marias</strong><small>BOARDING HOUSE</small></div><button className="close-nav" onClick={() => setMobileNav(false)}>×</button></div>
      <div className="workspace"><div className="workspace-icon">V3M</div><div><strong>Vinas Tres Marias</strong><span>Boarding house</span></div><span className="chevron">⌄</span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{visiblePages.map(item => { const count = item.id === 'Accounts' ? notificationCounts.account_requests : item.id === 'Maintenance' ? maintenanceBadgeCount : item.id === 'Tenant Portal' ? notificationCounts.tenant_updates : 0; return <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setQuery(''); setFilter('All'); setMobileNav(false) }}><span className="nav-icon">{item.icon}</span><span>{item.label}</span>{count > 0 && <span className="nav-count" aria-label={`${count} notifications`}>{count > 99 ? '99+' : count}</span>}</button>})}</nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon">✦</div><strong>Make your work easier</strong><p>Everything about your property, all in one place.</p>{currentUser?.role === 'admin' && <button onClick={() => setPage('Reports')}>Explore reports <span>↗</span></button>}</div><button className="help-link" onClick={() => notify('For assistance, contact your property administrator.')}><span>ⓘ</span> Help & support <span className="help-arrow">↗</span></button><button className="profile profile-button" onClick={() => currentUser?.role === 'admin' ? setPage('Settings') : notify(`Signed in as ${currentUser?.role}`)}><div className="avatar">{initials(currentUser?.name || 'User')}</div><div className="profile-copy"><strong>{currentUser?.name || 'Account'}</strong><span>{currentUser?.role || 'User'}</span></div><span className="profile-menu">⚙</span></button><button className="sidebar-signout" onClick={signOut}><span>↪</span> Sign out</button></div>
    </aside>
    {mobileNav && <button className="scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" />}
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><button className="mobile-menu" onClick={() => setMobileNav(true)}>☰</button><span>Vinas Tres Marias</span><span className="crumb-slash">/</span><strong>{page === 'Overview' ? 'Overview' : page}</strong></div><div className="top-actions"><span className="today-label">{new Date().toLocaleDateString('en-PH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>{currentUser?.role !== 'tenant' && <button className="icon-button" title="Search" onClick={() => document.querySelector('.search-input')?.focus()}>⌕</button>}<button className="icon-button notification" title="Notifications" aria-label={`${notificationTotal} notifications`} onClick={() => { setPage(notificationTarget); setMobileNav(false) }}>♧{notificationTotal > 0 && <span className="notification-total">{notificationTotal > 99 ? '99+' : notificationTotal}</span>}</button><span className="top-divider" /><button className="top-avatar" onClick={() => currentUser?.role === 'admin' ? setPage('Settings') : notify(currentUser?.role)}>{initials(currentUser?.name || 'User')}</button></div></header>
      <div className="page-content">
        {page === 'Tenant Portal' ? <TenantPortalView portal={tenantPortal} error={portalError} /> : page === 'Maintenance' && currentUser?.role === 'tenant' ? <TenantMaintenanceView portal={tenantPortal} error={portalError} onSubmit={submitTenantMaintenance} /> : page === 'Accounts' && currentUser?.role === 'admin' ? <>
          <div className="page-heading"><div><div className="eyebrow">ACCESS CONTROL</div><h1>User accounts</h1><p>Create staff and tenant logins and assign tenants to their accounts.</p></div></div>
          <section className="panel account-create-panel"><div className="panel-heading"><div><h2>Create account</h2><p>Tenant accounts are linked to an existing tenant or a new profile.</p></div></div><form className="field-grid account-create-form" onSubmit={createAccount}><label className="field"><span>Name</span><input name="name" required /></label><label className="field"><span>Email</span><input name="email" type="email" required /></label><label className="field"><span>Temporary password</span><input name="password" type="password" minLength="8" required /></label><label className="field"><span>Role</span><select name="role" defaultValue="staff"><option value="staff">Staff / Caretaker</option><option value="tenant">Tenant</option><option value="admin">Admin / Owner</option></select></label><label className="field"><span>Link existing tenant (optional)</span><select name="tenant_id" defaultValue=""><option value="">Create a new tenant profile</option>{data.tenants.map(tenant => <option key={tenant.id} value={tenant.id}>{tenant.full_name}</option>)}</select></label><label className="field"><span>Phone number (required for new tenant login)</span><input name="contact_number" type="tel" /></label><label className="field"><span>Emergency contact (optional)</span><input name="emergency_contact" /></label><div className="account-form-action"><button className="button button-primary" type="submit">Create account</button></div></form></section>
          <section className="panel table-panel data-panel"><div className="panel-heading"><div><h2>Existing accounts</h2><p>Review requests before granting access.</p></div><span className="row-count">{userAccounts.length} accounts</span></div><div className="table-scroll"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>LINKED TENANT</th><th>ACCESS</th><th /></tr></thead><tbody>{userAccounts.map(account => <tr key={account.id}><td><strong>{account.name}</strong></td><td>{account.email}</td><td>{({admin:'Admin / Owner',staff:'Staff / Caretaker',tenant:'Tenant'})[account.role] || account.role}</td><td>{account.tenant_name || data.tenants.find(tenant => Number(tenant.id) === Number(account.tenant_id))?.full_name || '—'}</td><td>{account.status === 'pending' ? 'Awaiting approval' : 'Active'}</td><td>{account.status === 'pending' && <button className="button button-outline account-approve" onClick={() => approveAccount(account)}>Approve</button>}</td></tr>)}</tbody></table>{userAccounts.length === 0 && <div className="empty-state"><strong>No accounts found</strong></div>}</div></section>
        </> : page === 'Overview' ? <>
          <div className="welcome-row dashboard-intro"><div className="intro-copy"><div className="eyebrow"><span /> {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div><h1>Good morning, {greetingName} <span className="wave">✳</span></h1><p>Here’s what’s happening at your property today.</p><div className="intro-caption"><span>✦</span> Your property, thoughtfully managed</div></div><div className="intro-art" aria-hidden="true"><span className="intro-orbit" /><span className="intro-flower">✿</span><span className="intro-leaf">❧</span><span className="intro-star">✧</span></div><button className="button button-primary" onClick={() => openAdd('Payments')}><span>＋</span> Record a payment</button></div>
          <section className="stats-grid">
            <StatCard icon="▦" tone="violet" label="Total rooms" value={data.rooms.length} note={<><b>{available} available</b> · {data.rooms.length - available} occupied or reserved</>} trend="↗" />
            <StatCard icon="♙" tone="blue" label="Active tenants" value={activeTenants} note={<><b>+1 tenant</b> this month</>} trend="↗" />
            <StatCard icon="₱" tone="green" label="Collected this month" value={money(collected)} note={<><b>October 2026</b> · 2 payments</>} trend="↗" />
            <StatCard icon="◷" tone="amber" label="Outstanding balance" value={money(overdue)} note={<><b>1 tenant</b> with a balance due</>} trend="!" />
          </section>
          <section className="dashboard-grid"><div className="panel occupancy-panel"><div className="panel-heading"><div><h2>Room occupancy</h2><p>A quick look at your rooms</p></div><button className="text-button" onClick={() => setPage('Rooms')}>View all rooms <span>→</span></button></div><div className="occupancy-summary"><div className="donut"><div><strong>{data.rooms.length ? Math.round(((data.rooms.length - available) / data.rooms.length) * 100) : 0}%</strong><span>occupied</span></div></div><div className="occupancy-legend"><div><span className="legend-dot dot-occupied" /><span>Occupied</span><strong>{data.rooms.filter(room => room.status === 'Occupied').length}</strong></div><div><span className="legend-dot dot-available" /><span>Available</span><strong>{available}</strong></div><div><span className="legend-dot dot-reserved" /><span>Reserved</span><strong>{data.rooms.filter(room => room.status === 'Reserved').length}</strong></div><div><span className="legend-dot dot-maintenance" /><span>Maintenance</span><strong>{data.rooms.filter(room => room.status === 'Under Maintenance').length}</strong></div></div></div><div className="panel-divider" /><div className="occupancy-foot"><span><span className="green-dot" /> Looking good! <span className="muted">Your occupancy is healthy.</span></span><span className="capacity">{data.rooms.length - available} of {data.rooms.length} rooms filled</span></div></div>
            <div className="panel collection-panel"><div className="panel-heading"><div><h2>Monthly collection</h2><p>Rental income received</p></div><button className="select-compact" onClick={() => notify('Showing October 2026')}>October 2026 <span>⌄</span></button></div><div className="collection-total"><strong>{money(collected)}</strong><span className="positive-tag">↗ 12.8%</span></div><div className="chart-caption">vs. previous month <strong>{money(11000)}</strong></div><div className="chart"><div className="chart-grid"><span>₱12k</span><span>₱9k</span><span>₱6k</span><span>₱3k</span><span>₱0</span></div><div className="chart-bars">{[34, 58, 47, 77, 53, 82, 60, 91, 68, 49, 75, 60].map((height, index) => <div key={index} className={`bar-column ${index === 9 ? 'current' : ''}`}><div className="bar" style={{ height: `${height}%` }} /></div>)}</div></div><div className="chart-months"><span>Nov</span><span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Oct</span></div></div></section>
          <section className="bottom-grid"><div className="panel table-panel"><div className="panel-heading"><div><h2>Recent payments</h2><p>Your latest rental transactions</p></div><button className="text-button" onClick={() => setPage('Payments')}>View all <span>→</span></button></div><PaymentsTable rows={data.payments.slice(0, 4)} /></div><div className="panel reminders-panel"><div className="panel-heading"><div><h2>Needs your attention</h2><p>A few things to take care of</p></div><span className="attention-count">{(preferences.maintenanceReminders ? data.maintenance.filter(row => row.status !== 'Resolved').length : 0) + (overdue > 0 ? 1 : 0)}</span></div><div className="reminder-list">{overdue > 0 && <div className="reminder"><div className="reminder-icon overdue-icon">₱</div><div className="reminder-copy"><strong>Rent balance due</strong><span>Daniel Cruz · Room 201</span></div><button onClick={() => { setPage('Payments'); setFilter('Partial') }}>Review <span>→</span></button></div>}{(preferences.maintenanceReminders ? data.maintenance.filter(row => row.status !== 'Resolved').slice(0, 3) : []).map(item => <div className="reminder" key={item.id}><div className="reminder-icon maintenance-icon">⌁</div><div className="reminder-copy"><strong>{item.title}</strong><span>Room {item.room} · {item.tenant}</span></div><button onClick={() => setPage('Maintenance')}>Review <span>→</span></button></div>)}{overdue === 0 && (!preferences.maintenanceReminders || !data.maintenance.some(row => row.status !== 'Resolved')) && <div className="empty-inline">You’re all caught up. Nothing needs attention.</div>}</div><button className="all-reminders" onClick={() => setPage('Maintenance')}>See all reminders <span>→</span></button></div></section>
          <div className="dashboard-footer"><span>Vinas Tres Marias Boarding House</span><span>All data saved automatically</span></div>
        </> : page === 'Reports' ? <>
          <div className="page-heading"><div><div className="eyebrow">PROPERTY INSIGHTS</div><h1>Reports</h1><p>Rental activity and property performance at a glance.</p></div><button className="button button-primary" onClick={csvExport}>↓ <span>Export CSV</span></button></div>
          <div className="stats-grid report-stats"><StatCard icon="₱" tone="green" label="October collections" value={money(collected)} note={<><b>{data.payments.length} recorded</b> payment entries</>} trend="↗" /><StatCard icon="◷" tone="amber" label="Outstanding balance" value={money(overdue)} note={<><b>{activeTenants} active</b> rental agreements</>} trend="!" /><StatCard icon="▦" tone="violet" label="Occupancy rate" value={`${data.rooms.length ? Math.round(((data.rooms.length - available) / data.rooms.length) * 100) : 0}%`} note={<><b>{available} rooms</b> currently available</>} trend="↗" /></div>
          <div className="panel table-panel reports-table"><div className="panel-heading"><div><h2>Tenant rental summary</h2><p>Current room assignment and monthly rate</p></div><span className="row-count">{data.tenants.length} tenants</span></div><table><thead><tr><th>TENANT</th><th>ROOM</th><th>MONTHLY RATE</th><th>LEASE ENDS</th><th>STATUS</th></tr></thead><tbody>{data.tenants.map(tenant => <tr key={tenant.id}><td><div className="tenant-cell"><span className="tenant-avatar">{initials(tenant.full_name)}</span><strong>{tenant.full_name}</strong></div></td><td>{tenant.room}</td><td className="amount-cell">{money(data.rooms.find(room => room.room_number === tenant.room)?.monthly_rate || 0)}</td><td>{dateLabel(tenant.move_out_date)}</td><td><Status value={tenant.status} /></td></tr>)}</tbody></table></div>
        </> : page === 'Settings' ? <>
          <div className="page-heading"><div><div className="eyebrow">PERSONALIZE YOUR WORKSPACE</div><h1>Settings</h1><p>Make Vinas Tres Marias feel just right for you.</p></div></div>
          <div className="settings-layout">
            <div className="settings-main">
              <section className="panel settings-panel"><div className="settings-section-title"><span className="settings-icon appearance-icon">☼</span><div><h2>Appearance</h2><p>Choose how your workspace looks.</p></div></div><SettingRow title="Dark mode" detail="Use a darker color theme across the dashboard." checked={preferences.theme === 'dark'} onChange={checked => updatePreferences({ theme: checked ? 'dark' : 'light' })} /><SettingRow title="Compact tables" detail="Show more records at once with tighter row spacing." checked={preferences.compactTables} onChange={checked => updatePreferences({ compactTables: checked })} /></section>
              <section className="panel settings-panel"><div className="settings-section-title"><span className="settings-icon reminder-settings-icon">⌁</span><div><h2>Dashboard reminders</h2><p>Choose which reminders appear on the overview page.</p></div></div><SettingRow title="Maintenance reminders" detail="Show pending and in-progress repair requests on your dashboard." checked={preferences.maintenanceReminders} onChange={checked => updatePreferences({ maintenanceReminders: checked })} /></section>
              <section className="panel settings-panel"><div className="settings-section-title"><span className="settings-icon data-settings-icon">⇩</span><div><h2>Your data</h2><p>Keep a backup of your boarding house records.</p></div></div><div className="settings-action-row"><div><strong>Download a data backup</strong><span>Save rooms, tenants, agreements, payments, and maintenance as a JSON file.</span></div><button className="button button-outline" onClick={() => { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); link.download = 'vinas-tres-marias-backup.json'; link.click(); URL.revokeObjectURL(link.href); notify('Backup downloaded') }}>↓ <span>Download backup</span></button></div></section>
            </div>
              <aside className="settings-side"><section className="panel account-panel"><div className="settings-section-title"><span className="settings-icon account-settings-icon">♙</span><div><h2>Account</h2><p>Your profile</p></div></div><div className="account-card"><span className="account-avatar">{initials(currentUser?.name || 'User')}</span><div><strong>{currentUser?.name}</strong><span>{currentUser?.email}</span></div></div><button className="signout-button" onClick={signOut}>↪ <span>Sign out</span></button></section><div className="settings-tip"><span>✦</span><strong>Good to know</strong><p>Your sign-in is checked by the local server.</p></div></aside>
          </div>
          <div className="dashboard-footer"><span>Vinas Tres Marias Boarding House</span><span>Preferences saved automatically</span></div>
        </> : <>
          <div className="page-heading"><div><div className="eyebrow">PROPERTY MANAGEMENT</div><h1>{page}</h1><p>{pageDescriptions[page]}</p></div>{configs[page] && <button className="button button-primary" onClick={() => openAdd()}><span>＋</span> Add {configs[page].title.toLowerCase()}</button>}</div>
          <div className="panel table-panel data-panel"><div className="data-toolbar"><div className="search-box"><span>⌕</span><input className="search-input" placeholder={`Search ${page.toLowerCase()}...`} value={query} onChange={event => setQuery(event.target.value)} /></div><div className="toolbar-right">{page !== 'Agreements' && <select value={filter} onChange={event => setFilter(event.target.value)}><option>All</option>{(page === 'Rooms' ? ['Available', 'Occupied', 'Reserved', 'Under Maintenance'] : page === 'Payments' ? ['Paid', 'Partial'] : page === 'Maintenance' ? ['Pending', 'In Progress', 'Resolved'] : ['Active', 'Reserved', 'Ended']).map(item => <option key={item}>{item}</option>)}</select>}<span className="row-count">{tableRows.length} records</span></div></div>
            {page === 'Payments' ? <PaymentsTable rows={tableRows} onDelete={removeRow} /> : <GenericTable page={page} rows={tableRows} data={data} onEdit={row => setModal({ record: row, seed: {} })} onDelete={removeRow} onStatus={(row, status) => { const key = page.toLowerCase(); const resolvedAt = status === 'Resolved' ? today : ''; saveData({ ...data, [key]: data[key].map(item => item.id === row.id ? { ...item, status, resolved_at: resolvedAt } : item) }); fetch(`/api/maintenance/${row.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ status, resolved_at: resolvedAt || null }) }).catch(() => {}); if (row.status === 'Pending') setNotificationCounts(counts => ({ ...counts, maintenance: Math.max(0, counts.maintenance - 1) })); notify('Request status updated') }} />}
            {tableRows.length === 0 && <div className="empty-state"><div>⌕</div><strong>No {page.toLowerCase()} found</strong><span>Try changing your search or add a new record.</span></div>}
            <div className="table-footer"><span>Showing <strong>{tableRows.length ? 1 : 0}–{tableRows.length}</strong> of <strong>{tableRows.length}</strong> records</span><div><button disabled>← Previous</button><button className="page-number">1</button><button disabled>Next →</button></div></div>
          </div><div className="dashboard-footer"><span>Vinas Tres Marias Boarding House</span><span>All data saved automatically</span></div>
        </>}
      </div>
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}><form className="record-modal" onSubmit={submitRecord}><div className="modal-heading"><div><span className="modal-kicker">PROPERTY RECORD</span><h2>{modal.record ? `Edit ${configs[modal.targetPage || page]?.title?.toLowerCase() || 'record'}` : `Add ${configs[modal.targetPage || page]?.title?.toLowerCase() || 'record'}`}</h2></div><button type="button" className="modal-close" onClick={() => setModal(null)}>×</button></div><div className="field-grid">{(configs[modal.targetPage || page]?.fields || []).map(renderField)}</div><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="button button-primary">{modal.record ? 'Save changes' : 'Add record'}</button></div></form></div>}
    {notice && <div className="toast"><span>✓</span>{notice}</div>}
  </div>
}

const pageDescriptions = { Rooms: 'Manage availability, rates, and the details of each room.', Tenants: 'Keep tenant profiles and their current room assignments up to date.', Agreements: 'Track move-in dates, rental terms, and active lease agreements.', Payments: 'Record rental payments and keep a clear history of collections.', Maintenance: 'Track reported issues from submission through resolution.', Accounts: 'Manage secure logins for administrators, staff, and tenants.' }

function initials(name = '') { return name.split(' ').map(word => word[0]).slice(0, 2).join('').toUpperCase() }

function SettingRow({ title, detail, checked, onChange }) {
  return <div className="setting-row"><div><strong>{title}</strong><span>{detail}</span></div><button type="button" className={`setting-switch ${checked ? 'switch-on' : ''}`} role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)}><span /></button></div>
}

function StatCard({ icon, tone, label, value, note, trend }) {
  return <div className="stat-card"><div className="stat-top"><div className={`stat-icon ${tone}`}>{icon}</div><span className={`stat-trend ${tone === 'amber' ? 'warning-trend' : ''}`}>{trend}</span></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>
}

function Status({ value }) {
  const map = { Available: 'green', Occupied: 'blue', Reserved: 'violet', 'Under Maintenance': 'amber', Active: 'green', Ended: 'gray', Paid: 'green', Partial: 'amber', Pending: 'amber', 'In Progress': 'blue', Resolved: 'green', High: 'red', Medium: 'amber', Low: 'gray' }
  return <span className={`status status-${map[value] || 'gray'}`}><i />{value}</span>
}

function PaymentsTable({ rows, onDelete }) {
  return <div className="table-scroll"><table><thead><tr><th>TENANT</th><th>ROOM</th><th>PERIOD</th><th>DATE</th><th>AMOUNT</th><th>METHOD</th><th>STATUS</th>{onDelete && <th />}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="tenant-cell"><span className="tenant-avatar">{initials(row.tenant)}</span><strong>{row.tenant}</strong></div></td><td>{row.room}</td><td>{row.payment_period}</td><td>{dateLabel(row.payment_date)}</td><td className="amount-cell">{money(row.amount)}</td><td>{row.payment_method}</td><td><Status value={row.status} /></td>{onDelete && <td><button className="row-action delete-action" onClick={() => onDelete(row)} aria-label="Delete payment">×</button></td>}</tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state"><div>₱</div><strong>No payments found</strong><span>Payments will show here when they are recorded.</span></div>}</div>
}

function GenericTable({ page, rows, data, onEdit, onDelete, onStatus }) {
  const actions = row => <div className="row-actions"><button className="row-action" aria-label="Edit" onClick={() => onEdit(row)}>✎</button><button className="row-action delete-action" aria-label="Delete" onClick={() => onDelete(row)}>×</button></div>
  if (page === 'Rooms') return <div className="table-scroll"><table><thead><tr><th>ROOM</th><th>TYPE</th><th>CAPACITY</th><th>MONTHLY RATE</th><th>STATUS</th><th>DESCRIPTION</th><th /></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="room-cell"><span className="room-icon">▦</span><div><strong>{row.room_number}</strong><small>Floor {row.floor}</small></div></div></td><td>{row.room_type}</td><td>{row.capacity} {row.capacity === 1 ? 'person' : 'people'}</td><td className="amount-cell">{money(row.monthly_rate)}</td><td><Status value={row.status} /></td><td className="muted-cell">{row.description}</td><td>{actions(row)}</td></tr>)}</tbody></table></div>
  if (page === 'Tenants') return <div className="table-scroll"><table><thead><tr><th>TENANT</th><th>CONTACT</th><th>ROOM</th><th>LEASE PERIOD</th><th>MONTHLY RENT</th><th>STATUS</th><th /></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="tenant-cell"><span className="tenant-avatar">{initials(row.full_name)}</span><div><strong>{row.full_name}</strong><small>{row.email}</small></div></div></td><td>{row.contact_number}</td><td>{row.room === 'Unassigned' ? 'Unassigned' : row.room}</td><td>{dateLabel(row.move_in_date)} <span className="muted">→</span> {dateLabel(row.move_out_date)}</td><td className="amount-cell">{money(data.rooms.find(room => room.room_number === row.room)?.monthly_rate || 0)}</td><td><Status value={row.status} /></td><td>{actions(row)}</td></tr>)}</tbody></table></div>
  if (page === 'Agreements') return <div className="table-scroll"><table><thead><tr><th>TENANT</th><th>ROOM</th><th>MOVE-IN</th><th>MOVE-OUT</th><th>MONTHLY RATE</th><th>DEPOSIT</th><th>STATUS</th><th /></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="tenant-cell"><span className="tenant-avatar">{initials(row.tenant)}</span><strong>{row.tenant}</strong></div></td><td>{row.room}</td><td>{dateLabel(row.move_in_date)}</td><td>{dateLabel(row.move_out_date)}</td><td className="amount-cell">{money(row.monthly_rate)}</td><td>{money(row.deposit_amount)}</td><td><Status value={row.status} /></td><td>{actions(row)}</td></tr>)}</tbody></table></div>
  return <div className="table-scroll"><table><thead><tr><th>ISSUE</th><th>TENANT / ROOM</th><th>PRIORITY</th><th>SUBMITTED</th><th>STATUS</th><th>ACTION</th><th /></tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><div className="issue-cell"><strong>{row.title}</strong><small>{row.description}</small></div></td><td><strong>{row.tenant}</strong><small className="block-small">{row.room}</small></td><td><Status value={row.priority} /></td><td>{dateLabel(row.submitted_at)}</td><td><Status value={row.status} /></td><td>{row.status !== 'Resolved' ? <button className="resolve-button" onClick={() => onStatus(row, row.status === 'Pending' ? 'In Progress' : 'Resolved')}>{row.status === 'Pending' ? 'Start work' : 'Resolve'} →</button> : <span className="muted-cell">Resolved {dateLabel(row.resolved_at)}</span>}</td><td>{actions(row)}</td></tr>)}</tbody></table></div>
}

export default App
