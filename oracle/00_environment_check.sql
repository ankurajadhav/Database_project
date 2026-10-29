-- ============================================================================
-- SCRIPT 00: ENVIRONMENT CHECK & ORACLE CONFIGURATION
-- Project: Smart Grocery Retail Management and Payment System
-- Student: Ankur Anil Jadhav (24BDS0162)
-- Course: BCSE302P - Database Systems (Lab Project)
-- Database: Oracle AI Database 23ai/26ai Free / Enterprise Edition
-- ============================================================================

SET SERVEROUTPUT ON SIZE UNLIMITED;
SET LINESIZE 200;
SET PAGESIZE 100;
SET ECHO ON;
SET FEEDBACK ON;

PROMPT ====================================================
PROMPT CHECKING ORACLE DATABASE ENVIRONMENT AND PERMISSIONS
PROMPT ====================================================

-- Check connected user and privilege
SELECT USER AS CURRENT_USER, SYS_CONTEXT('USERENV', 'CON_NAME') AS CONTAINER_NAME FROM DUAL;

-- Check Oracle Database version
SELECT BANNER_FULL FROM V$VERSION WHERE ROWNUM = 1;

-- Check session date/time format settings
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF';

PROMPT Environment verification complete.
