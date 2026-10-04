-- =====================================================================
-- BlockVault - Module 4 (Verification / Dashboard / Notification)
-- Oracle 12c+ (uses IDENTITY columns and OFFSET/FETCH)
-- =====================================================================

-- ---------------------------------------------------------------------
-- A) TABLES OWNED BY MODULE 4  (run these)
-- ---------------------------------------------------------------------
CREATE TABLE VERIFICATION_LOGS (
  LOG_ID          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  CERTIFICATE_ID  VARCHAR2(50),                       -- NULL/unknown ids are logged too
  METHOD          VARCHAR2(10)  NOT NULL CHECK (METHOD IN ('QR','UPLOAD','ID')),
  STATUS          VARCHAR2(12)  NOT NULL CHECK (STATUS IN ('VALID','TAMPERED','REVOKED','NOT_FOUND')),
  IP_ADDRESS      VARCHAR2(64),
  USER_AGENT      VARCHAR2(255),
  DETAILS         CLOB,                               -- JSON: reason + individual checks
  VERIFIED_AT     TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE INDEX IDX_VLOG_CERT   ON VERIFICATION_LOGS (CERTIFICATE_ID);
CREATE INDEX IDX_VLOG_TIME   ON VERIFICATION_LOGS (VERIFIED_AT);
CREATE INDEX IDX_VLOG_STATUS ON VERIFICATION_LOGS (STATUS);

CREATE TABLE NOTIFICATIONS (
  NOTIFICATION_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  USER_ID         NUMBER        NOT NULL,             -- FK -> USERS(USER_ID) (Module 2)
  TYPE            VARCHAR2(30)  NOT NULL,             -- VERIFICATION | VERIFICATION_ALERT | TAMPER_ALERT | INFO
  TITLE           VARCHAR2(200) NOT NULL,
  MESSAGE         VARCHAR2(1000) NOT NULL,
  IS_READ         NUMBER(1)     DEFAULT 0 NOT NULL CHECK (IS_READ IN (0,1)),
  EMAIL_SENT      NUMBER(1)     DEFAULT 0 NOT NULL CHECK (EMAIL_SENT IN (0,1)),
  CREATED_AT      TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL
);
CREATE INDEX IDX_NOTIF_USER ON NOTIFICATIONS (USER_ID, IS_READ);
-- After Module 2's USERS table exists:
-- ALTER TABLE NOTIFICATIONS ADD CONSTRAINT FK_NOTIF_USER FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID);

-- ---------------------------------------------------------------------
-- B) TABLES MODULE 4 READS (owned by Module 2 / Module 3)
--    Reference only. Skip these if your friends already created them,
--    but make sure the column names below exist (or edit the SQL in
--    src/services/*.js to match).
-- ---------------------------------------------------------------------
-- CREATE TABLE USERS (
--   USER_ID        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--   NAME           VARCHAR2(100),
--   EMAIL          VARCHAR2(150) UNIQUE NOT NULL,
--   PASSWORD_HASH  VARCHAR2(100) NOT NULL,           -- bcrypt
--   ROLE           VARCHAR2(20)  NOT NULL            -- ADMIN | ISSUER
-- );
--
-- CREATE TABLE CERTIFICATES (
--   CERTIFICATE_ID VARCHAR2(50) PRIMARY KEY,
--   STUDENT_NAME   VARCHAR2(150) NOT NULL,
--   COURSE         VARCHAR2(200),
--   ISSUE_DATE     DATE,
--   ISSUER_ID      NUMBER REFERENCES USERS(USER_ID),
--   CERT_HASH      VARCHAR2(64) NOT NULL,            -- SHA-256 hex of the final PDF
--   BLOCK_INDEX    NUMBER,                           -- block holding this certificate
--   TX_HASH        VARCHAR2(64),                     -- block hash
--   STATUS         VARCHAR2(10) DEFAULT 'ACTIVE' CHECK (STATUS IN ('ACTIVE','REVOKED'))
-- );
