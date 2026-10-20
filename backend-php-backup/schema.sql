CREATE DATABASE IF NOT EXISTS rental_bh_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_bh_system;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','staff','tenant') NOT NULL DEFAULT 'tenant',
  tenant_id BIGINT UNSIGNED NULL,
  status ENUM('pending','active') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS rooms (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, room_number VARCHAR(50) NOT NULL UNIQUE,
  floor INT NOT NULL DEFAULT 1, room_type VARCHAR(80) NOT NULL DEFAULT 'Shared', capacity INT NOT NULL,
  monthly_rate DECIMAL(10,2) NOT NULL, status ENUM('Available','Occupied','Reserved','Under Maintenance') NOT NULL DEFAULT 'Available',
  description TEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NULL,
  full_name VARCHAR(150) NOT NULL, contact_number VARCHAR(40) NOT NULL, email VARCHAR(190) NOT NULL,
  emergency_contact VARCHAR(190) NULL, status ENUM('Active','Reserved','Ended') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS rental_agreements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, tenant_id BIGINT UNSIGNED NOT NULL, room_id BIGINT UNSIGNED NOT NULL,
  move_in_date DATE NOT NULL, move_out_date DATE NULL, monthly_rate DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0, due_day TINYINT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('Active','Reserved','Ended') NOT NULL DEFAULT 'Active', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(tenant_id) REFERENCES tenants(id), FOREIGN KEY(room_id) REFERENCES rooms(id)
);
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, rental_agreement_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(10,2) NOT NULL, payment_date DATE NOT NULL, payment_period CHAR(7) NOT NULL,
  payment_method VARCHAR(60) NOT NULL, reference_number VARCHAR(100) NULL, notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(rental_agreement_id) REFERENCES rental_agreements(id)
);
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, room_id BIGINT UNSIGNED NOT NULL, tenant_id BIGINT UNSIGNED NULL,
  title VARCHAR(190) NOT NULL, description TEXT NOT NULL,
  priority ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium', status ENUM('Pending','In Progress','Resolved') NOT NULL DEFAULT 'Pending',
  submitted_at DATE NOT NULL, resolved_at DATE NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(room_id) REFERENCES rooms(id), FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS rental_charges (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, rental_agreement_id BIGINT UNSIGNED NOT NULL,
  description VARCHAR(190) NOT NULL, amount DECIMAL(10,2) NOT NULL, due_date DATE NOT NULL,
  status ENUM('Unpaid','Partial','Paid','Overdue') NOT NULL DEFAULT 'Unpaid', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(rental_agreement_id) REFERENCES rental_agreements(id)
);
CREATE TABLE IF NOT EXISTS property_snapshots (
  owner_id BIGINT UNSIGNED PRIMARY KEY, payload JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO users(name,email,password,role) VALUES
('Paul Sobrio','paulsobrio@gmail.com','$2y$12$AZe0iza47ee5j8iOo6dzV.5nGGvT5tIuvVH6yYUHF6B.8uoHDAKRm','admin');

