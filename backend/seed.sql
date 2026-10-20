USE rental_bh_system;
INSERT IGNORE INTO rooms(id,room_number,floor,room_type,capacity,monthly_rate,status,description) VALUES
(1,'Room 1',1,'Shared',5,5500,'Occupied','Ground floor · Shared bath'),
(2,'Room 2',1,'Shared',4,7800,'Available','Ground floor · Private balcony'),
(3,'Room 3',2,'Shared',6,6000,'Occupied','Second floor · Quiet corner'),
(4,'Room 4',2,'Shared',4,4200,'Under Maintenance','Second floor · Near common area'),
(5,'Room 5',2,'Shared',6,8000,'Reserved','Second floor · Ensuite bath'),
(6,'Room 6',3,'Shared',5,6200,'Available','Top floor · City view'),
(7,'Room 7',3,'Shared',4,7600,'Available','Top floor · Bright corner room'),
(8,'Room 8',3,'Shared',6,6100,'Available','Top floor · Near shared lounge'),
(9,'Room 9',4,'Shared',5,8200,'Available','Fourth floor · Private bath'),
(10,'Room 10',4,'Shared',4,4500,'Available','Fourth floor · Shared suite');
INSERT IGNORE INTO tenants(id,full_name,contact_number,email,emergency_contact,status) VALUES
(1,'Sofia Reyes','0917 555 0182','sofia.reyes@email.com','Maria Reyes · 0918 222 1000','Active'),
(2,'Daniel Cruz','0920 555 0114','daniel.cruz@email.com','Elena Cruz · 0917 323 4421','Active'),
(3,'Miguel Santos','0918 555 0199','miguel.santos@email.com','Rosa Santos · 0920 617 2222','Reserved');
INSERT IGNORE INTO rental_agreements(id,tenant_id,room_id,move_in_date,move_out_date,monthly_rate,deposit_amount,due_day,status) VALUES
(1,1,1,'2026-01-12','2026-12-31',5500,5500,1,'Active'),
(2,2,3,'2026-03-01','2027-02-28',6000,6000,1,'Active'),
(3,3,5,'2026-11-01','2027-10-31',8000,8000,1,'Reserved');
INSERT IGNORE INTO payments(id,rental_agreement_id,amount,payment_date,payment_period,payment_method,reference_number,notes) VALUES
(1,1,5500,'2026-10-02','2026-10','GCash','GC-27104',''),
(2,2,3000,'2026-10-04','2026-10','Bank transfer','BT-88310','Partial rent payment'),
(3,1,5500,'2026-09-02','2026-09','Cash','CS-10934','');
INSERT IGNORE INTO maintenance_requests(id,room_id,tenant_id,title,description,priority,status,submitted_at,resolved_at) VALUES
(1,4,3,'Leaking bathroom faucet','The faucet has been dripping since yesterday.','High','In Progress','2026-10-15',NULL),
(2,1,1,'Bedroom light not working','Ceiling light stopped working.','Medium','Pending','2026-10-18',NULL),
(3,3,2,'Window latch is loose','Please check the latch near the desk.','Low','Resolved','2026-10-10','2026-10-12');

INSERT INTO users(name,email,password,role,tenant_id) VALUES
('Demo Caretaker','staff.demo@vinas.test','$2y$10$HKNTMV9YYj/KqAwMVixXbeACHUiHPQdV1Y32xlFLqga06fiIVOGFq','staff',NULL),
('Sofia Reyes','tenant.sofia@vinas.test','$2y$10$pceQdeWPjm.8r6n0UwzrFuN2li9Ta6p4sXgdlP.Ez34A.vx.mU05a','tenant',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),password=VALUES(password),role=VALUES(role),tenant_id=VALUES(tenant_id);
UPDATE tenants SET user_id=(SELECT id FROM users WHERE email='tenant.sofia@vinas.test') WHERE id=1;
