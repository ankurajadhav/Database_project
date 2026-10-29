# INDIVIDUAL VIVA PREPARATION GUIDE (34 EXAMINER QUESTIONS)
**Course:** Database Systems (BCSE302P)  
**Project:** Smart Grocery Retail Management and Payment System  
**Student:** Ankur Anil Jadhav (Reg. No: 24BDS0162)  
**Faculty / Evaluator:** Dr. Anand Bihari, VIT  

---

### Design and Normalization

#### Q1. Why did you choose <your PK> as the primary key for <table>? What other candidate keys exist and why were they rejected? Why not a natural key?
**Answer:** In the `CUSTOMER` table, `CustomerID` was chosen as a surrogate primary key (an integer sequence/identity). The candidate keys were `CustomerID`, `CustomerEmail`, and `CustomerPhone`. Although `CustomerEmail` could function as a natural candidate key, natural keys are susceptible to real-world mutations (e.g., users change their email provider, or family members share phone numbers). Using `CustomerID` (NUMBER) produces compact 4-byte B-tree index entries, avoids cascading updates across foreign keys in child tables (`SALE`), and guarantees permanent immutability.

#### Q2. Give one functional dependency in your schema and prove it using attribute closure.
**Answer:** In the `PRODUCT` relation:  
`ProductID → ProductName, SellingPrice, Unit, CategoryID`  
**Proof by Attribute Closure:**  
Let $F = \{ \text{ProductID} \to (\text{ProductName, SellingPrice, Unit, CategoryID}), \text{CategoryID} \to \text{CategoryName} \}$.  
Compute $(\text{ProductID})^+$:  
1. Initial set: $(\text{ProductID})^+ = \{ \text{ProductID} \}$  
2. Apply FD $\text{ProductID} \to \text{ProductName, SellingPrice, Unit, CategoryID}$:  
   $(\text{ProductID})^+ = \{ \text{ProductID, ProductName, SellingPrice, Unit, CategoryID} \}$  
3. Since $(\text{ProductID})^+$ contains all non-key attributes of `PRODUCT`, `ProductID` is a superkey and minimal candidate key.

#### Q3. Show an update anomaly that would occur if two of your tables were merged. Which normal form prevents it?
**Answer:** If `PRODUCT` and `CATEGORY` were merged into a single denormalized table `PRODUCT_CATEGORY(ProductID, ProductName, CategoryID, CategoryName)`:  
If the store decides to rename category `"Dairy Products"` to `"Dairy & Refrigerated"`, every product row belonging to that category (e.g., Milk, Butter, Cheese) must be individually updated. Missing a single row causes an **update anomaly** (inconsistent category names).  
**Second/Third Normal Form (3NF)** prevents this by isolating independent entities (`CATEGORY`) with their own functional dependencies (`CategoryID → CategoryName`).

#### Q4. Is every 3NF relation in your schema also in BCNF? Give one relation where they could differ.
**Answer:** Yes, every relation in our final schema is in Boyce-Codd Normal Form (BCNF). For a relation to be in BCNF, for every non-trivial functional dependency $X \to Y$, $X$ must be a superkey. In 3NF, the condition is slightly relaxed: $Y$ may be a prime attribute (part of a candidate key) even if $X$ is not a superkey. Because our entities have single-attribute surrogate keys or clean independent candidate keys without overlapping composite keys, 3NF and BCNF coincide.

#### Q5. When would you intentionally denormalize in your project? What risk do you take on?
**Answer:** We would intentionally denormalize in high-velocity read-heavy reporting environments—for example, storing a pre-aggregated `TotalPaid` or caching `CategoryName` directly in `PRODUCT`. The risk is data inconsistency: any subsequent UPDATE to `CategoryName` or a voided `PAYMENT` requires synchronous distributed multi-table updates or reconciliation batch triggers.

#### Q6. Your M:N relationship: what is the primary key of the junction table, and why?
**Answer:** For `SALE_ITEM` (which resolves the M:N relationship `CONTAINS` between `SALE` and `PRODUCT`):  
We chose surrogate primary key `SaleItemID` with a strict composite unique constraint `UNIQUE(SaleID, ProductID)`.  
This ensures each product appears at most once per receipt, while providing a clean single-column numeric key for order returns or warranty audit references.

---

### Constraints and Integrity

#### Q7. For which FK did you choose ON DELETE CASCADE, and for which RESTRICT? What disaster occurs if swapped?
**Answer:**  
- `ON DELETE CASCADE` is set on `SALE_ITEM (SaleID)`: If a draft sale is dropped, its dependent item lines are legitimately deleted.  
- `RESTRICT / NO ACTION` is strictly enforced on `CUSTOMER`, `PRODUCT`, and `CLERK` references in `SALE`: Deleting a customer or product must NEVER cascade-delete historical financial transactions!  
**Disaster if swapped:** If `CUSTOMER` had `ON DELETE CASCADE`, deleting a former customer account would silently wipe out all past sales, accounting records, and payment audits, destroying the store's financial tax ledger!

#### Q8. What happens when a parent row referenced by a child row is deleted in your schema? Demonstrate.
**Answer:** Oracle rejects the operation with error:  
`ORA-02292: integrity constraint (FK_SALE_CUSTOMER) violated - child record found`.  
This guarantees referential integrity.

#### Q9. A CHECK constraint on a column allows NULL. Why does CHECK (qty > 0) not reject NULL, and how do you fix it?
**Answer:** In three-valued SQL logic (3VL), if `qty` is `NULL`, the expression `NULL > 0` evaluates to **`UNKNOWN`**. In Oracle, a CHECK constraint passes if the condition evaluates to `TRUE` OR `UNKNOWN` (it only fails if strictly `FALSE`).  
**The fix:** Combine `NOT NULL` with the check constraint:  
`QuantitySold NUMBER(10) NOT NULL CONSTRAINT ck_sale_qty CHECK (QuantitySold > 0)`.

#### Q10. Difference between DELETE, TRUNCATE, and DROP; which can be rolled back in your DBMS, and do triggers/FK rules matter?
**Answer:**  
- **`DELETE`**: DML command. Deletes rows one by one, logs changes to Oracle UNDO/REDO logs, fires row-level triggers, enforces foreign key constraints, and **can be rolled back** using `ROLLBACK`.  
- **`TRUNCATE`**: DDL command. Deallocates data extents immediately, performs implicit `COMMIT`, does not fire delete triggers, cannot be rolled back, and fails if child tables reference it via enabled FKs.  
- **`DROP`**: DDL command. Removes the table structure and data entirely from the data dictionary. Performs implicit `COMMIT`.

---

### Queries

#### Q11. Your query uses LEFT JOIN. Why not INNER JOIN? Show the row that would be lost.
**Answer:** Query C2 joins `CATEGORY` with `PRODUCT` where price > 100 using `LEFT JOIN`. If we used `INNER JOIN`, categories like `Vegetables`, `Bakery`, `Beverages`, and `Snacks` (which do not currently carry products costing > 100) would be omitted from the report. `LEFT JOIN` preserves all parent categories with `NULL` product columns.

#### Q12. WHERE vs HAVING: rewrite one of your queries wrongly and explain the error/result difference.
**Answer:** In Query B5:  
`SELECT CategoryID, COUNT(*), AVG(SellingPrice) FROM PRODUCT GROUP BY CategoryID HAVING AVG(SellingPrice) >= 50;`  
If an inexperienced student rewrites this as:  
`SELECT CategoryID, COUNT(*), AVG(SellingPrice) FROM PRODUCT WHERE AVG(SellingPrice) >= 50 GROUP BY CategoryID;`  
Oracle immediately throws: `ORA-00934: group function is not allowed here`. `WHERE` filters individual rows *before* grouping occurs, while `HAVING` filters aggregated group buckets *after* grouping.

#### Q13. NOT IN returns no rows because the subquery contains a NULL. Explain why and give the fix.
**Answer:** In SQL, `x NOT IN (1, 2, NULL)` expands to `x != 1 AND x != 2 AND x != NULL`. Because any comparison with NULL evaluates to `UNKNOWN`, the entire AND condition evaluates to `UNKNOWN` or `FALSE`, returning zero rows.  
**Fix:** Either use `NOT EXISTS` (which uses two-valued existence logic) or filter out NULLs in the subquery:  
`WHERE col NOT IN (SELECT sub_col FROM table WHERE sub_col IS NOT NULL)`.

#### Q14. EXISTS vs IN: when does the optimizer treat them differently? Which did you use and why?
**Answer:** `EXISTS` is evaluated as a boolean semi-join: the subquery halts evaluation immediately upon finding the first matching row (`WHERE EXISTS (SELECT 1 ...)`). In older RDBMSs, `IN` built a temporary hash set of all subquery rows. Modern Oracle Cost-Based Optimizers (CBO) frequently transform both into identical hash semi-joins, but `EXISTS` is safer when the subquery might return NULLs.

#### Q15. Correlated subquery vs join: rewrite your correlated query as a join; which is faster on 1M rows and why?
**Answer:** Query D6 (correlated subquery):  
`SELECT C.CustomerID, C.CustomerName FROM CUSTOMER C WHERE (SELECT COUNT(*) FROM SALE S WHERE S.CustomerID = C.CustomerID) > 0;`  
**Rewritten as semi-join:**  
`SELECT DISTINCT C.CustomerID, C.CustomerName FROM CUSTOMER C JOIN SALE S ON C.CustomerID = S.CustomerID;`  
On 1M rows, the join (or `EXISTS`) is drastically faster because Oracle uses a single Hash Semi-Join ($O(M + N)$) instead of scanning the child table repeatedly for every outer row ($O(M \times N)$).

#### Q16. UNION vs UNION ALL: cost difference and when the wrong choice gives wrong results.
**Answer:** `UNION` performs an explicit Sort-Unique / Hash Unique operation to eliminate duplicate records, incurring CPU and temporary tablespace memory overhead. `UNION ALL` concatenates datasets without deduplication ($O(1)$ sorting cost). However, if unique names are required (as in Query E1: PersonName across customers and clerks), using `UNION ALL` would incorrectly repeat individuals who are both customers and employees.

#### Q17. COUNT(*), COUNT(col), COUNT(DISTINCT col) on your data: predict the three results.
**Answer:** In `CUSTOMER`:  
- `COUNT(*)` = 10 (counts all physical rows).  
- `COUNT(CustomerEmail)` = 10 (counts rows where email is NOT NULL).  
- `COUNT(DISTINCT CustomerEmail)` = 10 (counts unique non-null emails).

---

### Indexing and Optimization

#### Q18. Why did you index (col_a, col_b) in that order? Will the query WHERE col_b = ? use it?
**Answer:** In a composite B-tree index on `(col_a, col_b)`, entries are ordered first by `col_a` and then by `col_b`. A query filtering strictly on `col_b = ?` skips the leading index key; in standard B-tree lookups, Oracle cannot perform a direct index range scan (though it may perform an Index Skip Scan if `col_a` has very few distinct values, but with higher cost than a dedicated index).

#### Q19. Give a query in your project where an index exists but will not be used. Why?
**Answer:** On `SALE(SaleDateTime)`:  
`SELECT * FROM SALE WHERE TRUNC(SaleDateTime) = DATE '2026-01-01';`  
Wrapping `SaleDateTime` inside `TRUNC()` hides the indexed column from the B-tree range scan, forcing Oracle to perform a full table scan (`TABLE ACCESS FULL`). Rewriting as a range predicate `>= DATE '2026-01-01' AND < DATE '2026-01-02'` restores the `INDEX RANGE SCAN`.

#### Q20. Explain your EXPLAIN output row by row. What join algorithm is used and why?
**Answer:** In Query CQ-01:  
1. `SELECT STATEMENT`: Root plan operation, Cost = 6.  
2. `HASH JOIN`: Oracle builds an in-memory hash table on the smaller table (`CUSTOMER`), then scans `SALE` matching hash buckets. Hash joins are preferred over Nested Loops when joining moderate-to-large unsorted sets.  
3. `TABLE ACCESS FULL` on `CUSTOMER` and `SALE`.

#### Q21. Your table has 200 rows and the index gives no speed-up. Why? How would you prove the benefit?
**Answer:** When a table fits within a single or few Oracle disk blocks (e.g. 200 rows in an 8KB block), a multi-block read (`TABLE ACCESS FULL`) reads the entire table in 1 I/O operation. An index lookup requires traversing index branch blocks plus a single-block table read, costing more I/O. To prove the benefit, we generate a 100,000-row synthetic test table (`BIG_SALES`) and compare `AUTOTRACE` statistics showing index range scan reducing consistent gets from 1,200 to 3.

#### Q22. What is the cost of adding five more indexes to your orders table?
**Answer:** Write amplification: every `INSERT`, `UPDATE`, or `DELETE` on `SALE` must update all five B-tree structures, acquire index block latches, generate additional UNDO/REDO logging, and increase database storage footprint.

---

### Transactions and Concurrency

#### Q23. Two customers buy the last item simultaneously. Walk through what happens at Read Committed, then how you would prevent overselling.
**Answer:**  
1. In standard Read Committed without row locking: User A reads `QuantityOnHand = 1`. User B reads `QuantityOnHand = 1`.  
2. User A updates `QuantityOnHand = 1 - 1 = 0` and commits.  
3. User B updates `QuantityOnHand = 1 - 1 = 0` and commits.  
**Result:** 2 units sold when only 1 existed (lost update / overselling!).  
**Prevention in our system:** Before checking stock in `PROC_PROCESS_SALE`, we acquire an exclusive row lock:  
`SELECT QuantityOnHand FROM INVENTORY WHERE ProductID = ? FOR UPDATE;`  
User B is blocked until User A commits; when User B unblocks, User B reads the updated value (`0`) and is rejected with `ORA-20008: Insufficient stock`.

#### Q24. Explain a lost update with your own tables and show two ways to prevent it (locking vs isolation vs optimistic versioning).
**Answer:** Two clerks updating `ReorderLevel` on the same inventory item simultaneously.  
- **Pessimistic Locking:** `SELECT ... FOR UPDATE` locks the row until transaction end.  
- **Optimistic Versioning:** Add `Version NUMBER` column. `UPDATE INVENTORY SET ..., Version = Version + 1 WHERE InventoryID = ? AND Version = :old_version;` If `SQL%ROWCOUNT = 0`, raise concurrency collision.

#### Q25. Dirty read vs non-repeatable read vs phantom read: which isolation level in your DBMS prevents each?
**Answer:**  
- **Dirty Read:** Reading uncommitted changes. Oracle **never** allows dirty reads at any isolation level because of multi-version concurrency control (MVCC / UNDO segments).  
- **Non-Repeatable Read:** Re-reading the same row within a transaction and seeing modified values. Prevented by `SERIALIZABLE` or `READ ONLY` isolation levels.  
- **Phantom Read:** Re-executing a range query and seeing newly inserted matching rows. Prevented by `SERIALIZABLE`.

#### Q26. Explain how your DBMS guarantees durability after a power failure (log, checkpoint, fsync).
**Answer:** Oracle uses Write-Ahead Logging (WAL) via Redo Log files and the Log Writer process (`LGWR`). When a transaction issues `COMMIT`, LGWR writes the transaction's redo vectors from the SGA Redo Log Buffer to the online redo log on disk and flushes (`fsync`). The database writer (`DBWn`) can write dirty data blocks later asynchronously at checkpoints. Upon recovery, Oracle rolls forward using redo logs and rolls back uncommitted transactions using UNDO.

#### Q27. How could a deadlock occur in your place_order procedure? How would you avoid it (lock ordering, retry)?
**Answer:** If Customer 1 buys Product A and Product B, while Customer 2 buys Product B and Product A simultaneously:  
Customer 1 locks Product A and waits for Product B. Customer 2 locks Product B and waits for Product A.  
**Deadlock occurs! (ORA-00060).**  
**Prevention:** We sort product IDs in ascending numerical order (`ORDER BY ProductID ASC`) prior to acquiring `FOR UPDATE` locks. Both transactions lock Product A first, eliminating circular wait conditions!

---

### Procedural SQL and Security

#### Q28. Why is your business rule in a stored procedure and not the application? When would a trigger be worse than a procedure?
**Answer:** Placing checkout and receipt logic in stored procedures (`PROC_PROCESS_SALE`, `PROC_RECEIVE_STOCK`) ensures ACID atomicity within the database boundary. Any client (web app, batch script, mobile POS) inherits the exact same validation rules without duplicating code.  
**Why a trigger can be worse:** Triggers execute implicitly with hidden side-effects, can lead to mutating table errors (`ORA-04091`), and complicate transaction debugging.

#### Q29. Function vs procedure: why did you implement <X> as a function? Can it be used in SELECT? Can it contain a transaction?
**Answer:** We implemented `FN_PRODUCT_PRICE_LEVEL` as a function because it takes input, computes a deterministic scalar label (`'High'`, `'Medium'`, `'Low'`), and returns a value. Because it is a deterministic function that does not alter database state, it can be embedded directly inside `SELECT` queries (e.g. Query F1). Stored functions called from `SELECT` cannot contain autonomous DML transactions (`COMMIT`/`ROLLBACK`).

#### Q30. Why would a set-based UPDATE beat your cursor? When is a cursor still justified?
**Answer:** Set-based SQL operates in Oracle kernel memory in bulk block operations ($O(1)$ context switches). Explicit cursors switch context between the SQL engine and the PL/SQL runtime engine for every fetched row (row-by-row / slow-by-slow). Cursors are justified only when row processing requires complex external API calls, procedural branching, or custom per-record logging.

#### Q31. A login form builds SELECT * FROM users WHERE name='"+input+"'. Craft the injection, then show two defenses.
**Answer:**  
Input: `' OR '1'='1' --`  
Resulting SQL: `SELECT * FROM users WHERE name='' OR '1'='1' --'` (bypasses auth).  
**Two Defenses:**  
1. Parameterized Queries / Bind Variables: `SELECT * FROM users WHERE name = :username;` (Oracle treats input strictly as literal data).  
2. Principle of Least Privilege: Restricted web application database role without administrative data catalog access.

#### Q32. A staff member should see only their branch’s data. Design it with views/roles/privileges without changing application code.
**Answer:** Use Oracle Virtual Private Database (VPD) / Fine-Grained Auditing (FGA) via `DBMS_RLS.ADD_POLICY`. A security policy function dynamically appends `WHERE BranchID = SYS_CONTEXT('GROCERY_CTX', 'BRANCH_ID')` to any query against the table transparently.

#### Q33. How are passwords stored in your system? What is wrong with MD5(password)?
**Answer:** Passwords must be hashed using a slow, salted cryptographic key derivation function (e.g. bcrypt or Argon2id with work factor $\ge 12$). MD5 is fatally broken: it computes in nanoseconds, allowing attackers to check billions of guesses per second using GPUs and rainbow tables.

#### Q34. The orders table is accidentally emptied at 3:15 PM. Using your backup strategy, how do you recover to 3:14 PM?
**Answer:** Use Oracle Flashback Table:  
`FLASHBACK TABLE SALE TO TIMESTAMP (SYSTIMESTAMP - INTERVAL '2' MINUTE);`  
Or if Flashback is disabled: use Oracle Recovery Manager (RMAN) Point-in-Time Recovery (PITR):  
Restore database from prior full backup, apply archivelogs, and issue `RECOVER DATABASE UNTIL TIME '2026-10-28 15:14:00';` followed by `ALTER DATABASE OPEN RESETLOGS;`.
