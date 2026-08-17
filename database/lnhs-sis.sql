-- LNHS-SIS fresh-install database bootstrap
-- WARNING: This script drops and recreates the `lnhs-sis` database.
-- Back up any existing LNHS-SIS data before importing this file.

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS `lnhs-sis`;
CREATE DATABASE `lnhs-sis`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `lnhs-sis`;

CREATE TABLE `ADDRESS_T` (
  `address_id` INT NOT NULL AUTO_INCREMENT,
  `houseNo` VARCHAR(20) NULL,
  `street_barangay` VARCHAR(100) NOT NULL,
  `city_municipality` VARCHAR(100) NOT NULL DEFAULT 'Ligao City',
  `province` VARCHAR(100) NOT NULL DEFAULT 'Albay',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `PARENT_GUARDIAN_T` (
  `parent_guardian_id` INT NOT NULL AUTO_INCREMENT,
  `pgFirstName` VARCHAR(50) NOT NULL,
  `pgMiddleName` VARCHAR(50) NULL,
  `pgLastName` VARCHAR(50) NOT NULL,
  `pgContactNum` VARCHAR(20) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`parent_guardian_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DEPARTMENT_T` (
  `department_id` INT NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(100) NOT NULL,
  `department_description` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `STRAND_T` (
  `strand_id` INT NOT NULL AUTO_INCREMENT,
  `department_id` INT NOT NULL,
  `strand_name` VARCHAR(100) NOT NULL,
  `strand_description` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`strand_id`),
  KEY `strand_department_idx` (`department_id`),
  CONSTRAINT `strand_department_fk`
    FOREIGN KEY (`department_id`) REFERENCES `DEPARTMENT_T` (`department_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SECTION_T` (
  `section_id` INT NOT NULL AUTO_INCREMENT,
  `strand_id` INT NOT NULL,
  `grade_level` INT NOT NULL,
  `section_name` VARCHAR(100) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`section_id`),
  KEY `section_strand_idx` (`strand_id`),
  CONSTRAINT `section_strand_fk`
    FOREIGN KEY (`strand_id`) REFERENCES `STRAND_T` (`strand_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `CURRICULUM_T` (
  `curriculum_id` INT NOT NULL AUTO_INCREMENT,
  `strand_id` INT NOT NULL,
  `subject_name` VARCHAR(150) NOT NULL,
  `subject_description` VARCHAR(255) NOT NULL,
  `grade_level` ENUM('11', '12') NOT NULL,
  `semester` ENUM('1st Semester', '2nd Semester') NOT NULL,
  `type` ENUM('core', 'specialized') NOT NULL,
  `isRegular` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`curriculum_id`),
  UNIQUE KEY `curriculum_strand_grade_semester_subject_unique`
    (`strand_id`, `grade_level`, `semester`, `subject_name`),
  CONSTRAINT `curriculum_strand_fk`
    FOREIGN KEY (`strand_id`) REFERENCES `STRAND_T` (`strand_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `USERS_T` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `firstname` VARCHAR(100) NOT NULL,
  `middlename` VARCHAR(100) NULL,
  `lastname` VARCHAR(100) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `type` ENUM('admin', 'department_user', 'section_user') NOT NULL,
  `status` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `STUDENT_T` (
  `student_id` BIGINT NOT NULL,
  `guardian_id` INT NULL,
  `currentAddress` INT NULL,
  `permanentAddress` INT NULL,
  `first_name` VARCHAR(50) NOT NULL,
  `middle_name` VARCHAR(50) NULL,
  `last_name` VARCHAR(50) NOT NULL,
  `suffix` ENUM('Jr.', 'Sr.', 'II', 'III', 'IV') NULL,
  `birth_date` DATE NOT NULL,
  `place_of_birth` VARCHAR(100) NOT NULL,
  `age` INT NOT NULL,
  `sex` ENUM('Male', 'Female') NOT NULL,
  `contact_num` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `religion` VARCHAR(50) NOT NULL,
  `height` DECIMAL(5,2) NULL,
  `weight` DECIMAL(5,2) NULL,
  `bmi` DECIMAL(5,2) NULL,
  `nationality` VARCHAR(50) NULL DEFAULT 'Filipino',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`student_id`),
  KEY `student_guardian_idx` (`guardian_id`),
  KEY `student_current_address_idx` (`currentAddress`),
  KEY `student_permanent_address_idx` (`permanentAddress`),
  CONSTRAINT `student_guardian_fk`
    FOREIGN KEY (`guardian_id`) REFERENCES `PARENT_GUARDIAN_T` (`parent_guardian_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_current_address_fk`
    FOREIGN KEY (`currentAddress`) REFERENCES `ADDRESS_T` (`address_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `student_permanent_address_fk`
    FOREIGN KEY (`permanentAddress`) REFERENCES `ADDRESS_T` (`address_id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ACADEMIC_INFO_T` (
  `acads_id` INT NOT NULL AUTO_INCREMENT,
  `student_id` BIGINT NOT NULL,
  `department_id` INT NULL,
  `strand_id` INT NULL,
  `section_id` INT NULL,
  `gradeLevel` ENUM('11', '12') NOT NULL,
  `schoolYear` VARCHAR(9) NOT NULL,
  `semester` ENUM('1st Semester', '2nd Semester', 'Summer Class') NOT NULL,
  `entryStatus` ENUM(
    'New Enrollee', 'Regular', 'Irregular', 'Transferee', 'Returning', 'Remedial'
  ) NOT NULL,
  `exitStatus` ENUM(
    'Pending', 'Completed', 'Promoted with Deficiencies', 'Failed', 'Dropped',
    'Transferred Out', 'Shifted', 'Graduated'
  ) NOT NULL DEFAULT 'Pending',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`acads_id`),
  KEY `academic_info_student_idx` (`student_id`),
  KEY `academic_info_department_idx` (`department_id`),
  KEY `academic_info_strand_idx` (`strand_id`),
  KEY `academic_info_section_idx` (`section_id`),
  CONSTRAINT `academic_info_student_fk`
    FOREIGN KEY (`student_id`) REFERENCES `STUDENT_T` (`student_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `academic_info_department_fk`
    FOREIGN KEY (`department_id`) REFERENCES `DEPARTMENT_T` (`department_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `academic_info_strand_fk`
    FOREIGN KEY (`strand_id`) REFERENCES `STRAND_T` (`strand_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `academic_info_section_fk`
    FOREIGN KEY (`section_id`) REFERENCES `SECTION_T` (`section_id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ACADEMIC_PERFORMANCE_T` (
  `performance_id` INT NOT NULL AUTO_INCREMENT,
  `acads_id` INT NOT NULL,
  `gpa` DECIMAL(4,2) NULL,
  `honors` VARCHAR(50) NULL,
  `remarks` TEXT NULL,
  PRIMARY KEY (`performance_id`),
  UNIQUE KEY `academic_performance_acads_unique` (`acads_id`),
  CONSTRAINT `academic_performance_acads_fk`
    FOREIGN KEY (`acads_id`) REFERENCES `ACADEMIC_INFO_T` (`acads_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `GRADES_T` (
  `grade_id` INT NOT NULL AUTO_INCREMENT,
  `acads_id` INT NOT NULL,
  `curriculum_id` INT NOT NULL,
  `grade` DECIMAL(5,2) NULL,
  `grade_remarks` VARCHAR(50) NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`grade_id`),
  UNIQUE KEY `grades_academic_record_curriculum_unique` (`acads_id`, `curriculum_id`),
  KEY `grades_curriculum_idx` (`curriculum_id`),
  CONSTRAINT `grades_academic_info_fk`
    FOREIGN KEY (`acads_id`) REFERENCES `ACADEMIC_INFO_T` (`acads_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `grades_curriculum_fk`
    FOREIGN KEY (`curriculum_id`) REFERENCES `CURRICULUM_T` (`curriculum_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ACADEMIC_SETTINGS_T` (
  `settings_id` INT NOT NULL AUTO_INCREMENT,
  `current_school_year` VARCHAR(9) NOT NULL,
  `current_semester` ENUM('1st Semester', '2nd Semester', 'Summer Class') NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`settings_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `DEPARTMENT_USER_T` (
  `user_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `department_user_department_idx` (`department_id`),
  CONSTRAINT `department_user_user_fk`
    FOREIGN KEY (`user_id`) REFERENCES `USERS_T` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `department_user_department_fk`
    FOREIGN KEY (`department_id`) REFERENCES `DEPARTMENT_T` (`department_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SECTION_USER_T` (
  `user_id` INT NOT NULL,
  `section_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `section_user_section_idx` (`section_id`),
  KEY `section_user_department_idx` (`department_id`),
  CONSTRAINT `section_user_user_fk`
    FOREIGN KEY (`user_id`) REFERENCES `USERS_T` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `section_user_section_fk`
    FOREIGN KEY (`section_id`) REFERENCES `SECTION_T` (`section_id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `section_user_department_fk`
    FOREIGN KEY (`department_id`) REFERENCES `DEPARTMENT_T` (`department_id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `REPORTS_T` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `content` TEXT NOT NULL,
  `department_id` INT NULL,
  `section_id` INT NULL,
  `created_by` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reports_department_idx` (`department_id`),
  KEY `reports_section_idx` (`section_id`),
  KEY `reports_creator_idx` (`created_by`),
  CONSTRAINT `reports_department_fk`
    FOREIGN KEY (`department_id`) REFERENCES `DEPARTMENT_T` (`department_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reports_section_fk`
    FOREIGN KEY (`section_id`) REFERENCES `SECTION_T` (`section_id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `reports_creator_fk`
    FOREIGN KEY (`created_by`) REFERENCES `USERS_T` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `SequelizeMeta` (
  `name` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `sequelize_meta_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `SequelizeMeta` (`name`)
VALUES ('20260817000000-initialize-lnhs-sis.js');

INSERT INTO `USERS_T` (
  `firstname`, `middlename`, `lastname`, `username`, `password`, `type`, `status`,
  `createdAt`, `updatedAt`
) VALUES (
  'System', NULL, 'Administrator', 'admin',
  '$2b$12$9cGEtPQ1r9MYFHnc/kqaTO4xa.Ql.O0mIS.b/k5jHx0wGrk9jHqlu',
  'admin', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
