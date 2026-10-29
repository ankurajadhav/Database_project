-- ============================================================================
-- MASTER RUNNER SCRIPT: run_all.sql
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- ============================================================================

SPOOL grocery_installation.log;

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 00: ENVIRONMENT CHECK
PROMPT =====================================================================
@00_environment_check.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 01: DDL SCHEMA CREATION (11 TABLES IN 3NF)
PROMPT =====================================================================
@01_schema.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 02: DML SEED DATA POPULATION
PROMPT =====================================================================
@02_seed_data.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 03: DATABASE VIEWS
PROMPT =====================================================================
@03_views.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 04: STORED PROCEDURES AND FUNCTIONS
PROMPT =====================================================================
@04_procedures_functions.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 05: TRIGGERS AND CURSORS
PROMPT =====================================================================
@05_triggers_cursors.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 06: SECURITY AND ROLES
PROMPT =====================================================================
@06_security.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 07: INDEXING AND OPTIMIZATION
PROMPT =====================================================================
@07_indexes_optimization.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 08: INTEGRITY VERIFICATION
PROMPT =====================================================================
@08_verification.sql

PROMPT =====================================================================
PROMPT EXECUTING SCRIPT 09: DEMONSTRATION QUERIES
PROMPT =====================================================================
@09_demo_queries.sql

PROMPT =====================================================================
PROMPT ALL SCRIPTS COMPLETED SUCCESSFULLY. LOG WRITTEN TO grocery_installation.log
PROMPT =====================================================================

SPOOL OFF;
