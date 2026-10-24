# College MIS - Finance Module Specification
## Riatirimba Technical and Vocational College
### Version 5.0 - Versioned Fee Structures, Personal Terms, Inter-Service Triggers

---

## 1. Core Mental Model

### 1.1 How Fee Resolution Works

The fee a student pays when enrolling in a term is determined by exactly two things:

1. **Their personal term number** (1, 2, or 3 - where they are in their own journey)
2. **The fee structure version that was active on their enrollment date**

Nothing else. No fixed calendar windows. No academic year buckets.

```
Fee to apply = fee_structures
               WHERE term_number = :student_personal_term
               AND   scope       = resolved(programme → department → college)
               AND   valid_from <= :enrollment_date
               AND   (valid_to IS NULL OR valid_to >= :enrollment_date)
               ORDER BY valid_from DESC
               LIMIT 1
```

### 1.2 Fee Structure Versions

The college issues a fee structure once and it stays in force indefinitely -
until the college officially announces a change. When they do, admin creates a
new fee structure version with a `valid_from` date set to whenever the college
says the new rates take effect. The old version's `valid_to` is set to the day
before.

```
Fee Structure v1 (the gazette from 2026)
  valid_from: 2026-01-01
  valid_to:   2027-07-31      ← admin sets this when v2 is announced
  Term 1: 22,398 | Term 2: 22,396 | Term 3: 22,395

Fee Structure v2 (new gazette, announced Aug 2027)
  valid_from: 2027-08-01
  valid_to:   NULL            ← open-ended until next announcement
  Term 1: 24,000 | Term 2: 23,800 | Term 3: 23,600
```

### 1.3 Concrete Student Examples

```
Student A joins Sep 2026        → personal term = 1, enrollment_date = 2026-09-05
  → Picks up v1 rates (valid_from 2026-01-01, still active)
  → Term 1 fee = 22,398

Student A returns Sep 2027      → personal term = 2, enrollment_date = 2027-09-08
  → v2 now active (valid_from 2027-08-01)
  → Term 2 fee = 23,800   ← new rates, even though same student

Student A returns Mar 2028      → personal term = 3, enrollment_date = 2028-03-10
  → v2 still active (valid_to = NULL)
  → Term 3 fee = 23,600

───────────────────────────────────────────────────────────

Student B joins Jan 2026        → personal term = 1, enrollment_date = 2026-01-08
  → v1 rates
  → Term 1 fee = 22,398

Student C joins Jan 2026        → personal term = 2, enrollment_date = 2026-01-10
  (returning student, was at term 1 sometime before)
  → v1 rates, but term_number = 2
  → Term 2 fee = 22,396

Students B and C walk in the same week.
Same fee version applies to both (v1 active).
Different personal terms → different amounts.

───────────────────────────────────────────────────────────

Student D joins Sep 2027        → personal term = 1, enrollment_date = 2027-09-01
  → v2 active from 2027-08-01
  → Term 1 fee = 24,000   ← higher than Student B who joined in 2026
```

### 1.4 The College Controls Rollout Timing

When the college announces a fee increment, admin sets:
- `valid_from` on the new version = the date the college says new rates start
- `valid_to` on the old version = the day before `valid_from`

All students who enroll on or after `valid_from` get the new rates automatically.
All existing obligations are completely unaffected - their snapshots are frozen.
The college can set `valid_from` to a future date, giving the system time to
prepare before the new rates kick in.

### 1.5 A Student's Journey is Not Time-Bound

A student is not obligated to move term by term within any fixed period. They
start when they can, they pause when life requires it, they return when ready.

```
Student E timeline:
  2024-09-02  joins   → Term 1 (v1 rates, whatever they were in 2024)
  2026-01-10  returns → Term 2 (v1 rates, still active in Jan 2026)
  2029-03-15  returns → Term 3 (v3 rates, if another gazette came by 2029)

Finance does not care about the gaps. It only cares about:
  - What personal term is this? (sent by Academics)
  - What fee version was active on this enrollment date? (resolved by Finance)
```

### 1.6 Inter-Service Trigger

The Academics service owns when a student moves terms. Finance reacts.

```
HOD advances student to next term in Academics system
        │
        ▼
Academics calls Finance:
POST /api/finance/enrollment-events
        │
        ▼
Finance resolves fee structure → creates obligation → snapshots rates
→ applies credit if any → returns result to Academics
```

---

## 2. Official Fee Structure (Gazette, 04 May 2026)

### 2.1 Recurring Term Fees (Fee Version v1)

| Vote Head | Term 1 | Term 2 | Term 3 | Annual Total |
|---|---:|---:|---:|---:|
| Activity | 1,600 | 1,600 | 1,600 | 4,800 |
| Electricity, Water & Conservancy | 1,324 | 1,323 | 1,323 | 3,970 |
| Local Travel & Transport | 1,400 | 1,400 | 1,400 | 4,200 |
| Personal Emoluments | 3,500 | 3,500 | 3,500 | 10,500 |
| R.M.I | 1,334 | 1,333 | 1,333 | 4,000 |
| Tuition | 13,240 | 13,240 | 13,239 | 39,719 |
| **Total** | **22,398** | **22,396** | **22,395** | **67,189** |

### 2.2 One-Time New Student Charges (not versioned - set per policy)

| Charge | Amount |
|---|---:|
| Admission Fee | 500 |
| Student ID | 500 |
| Caution Money | 1,000 |
| KUCCPS Registration | 1,550 |
| **Total** | **3,550** |

### 2.3 HELB Classification Bands (Annual Total = 67,189)

| Band | Scholarship % | Scholarship (KSH) | Loan % | Loan (KSH) | Household % | Household (KSH) | Upkeep |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 70% | 47,032 | 22.5% | 15,118 | 7.5% | 5,039 | 18,600 |
| 2 | 60% | 40,314 | 28% | 18,813 | 12% | 8,063 | 17,600 |
| 3 | 50% | 33,595 | 32% | 21,500 | 18% | 12,094 | 15,600 |
| 4 | 40% | 26,876 | 38% | 25,532 | 22% | 14,782 | 14,600 |
| 5 | 30% | 20,157 | 43% | 28,891 | 27% | 18,141 | 13,600 |

---

## 3. Database Schema

### 3.1 `vote_heads`

Global configurable fee categories. Never hardcoded as columns.

```sql
CREATE TABLE vote_heads (
    id             VARCHAR(20) PRIMARY KEY,
    name           VARCHAR(100) NOT NULL UNIQUE,
    description    VARCHAR(200),
    is_one_time    BOOLEAN DEFAULT FALSE,
    -- true = charged once ever per student regardless of term
    is_refundable  BOOLEAN DEFAULT FALSE,
    -- true = refunded on programme completion (e.g. Caution Money)
    priority_order INT NOT NULL UNIQUE,
    -- waterfall fill order - lower number filled first on partial payment
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT NOW()
);
```

**Example data:**

| id | name | is_one_time | is_refundable | priority_order |
|---|---|---|---|---|
| VH-ADM | Admission Fee | true | false | 1 |
| VH-ID | Student ID | true | false | 2 |
| VH-CAU | Caution Money | true | true | 3 |
| VH-KUC | KUCCPS Registration | true | false | 4 |
| VH-ACT | Activity | false | false | 5 |
| VH-EWC | Electricity, Water & Conservancy | false | false | 6 |
| VH-LTT | Local Travel & Transport | false | false | 7 |
| VH-PE | Personal Emoluments | false | false | 8 |
| VH-RMI | R.M.I | false | false | 9 |
| VH-TUI | Tuition | false | false | 10 |

---

### 3.2 `departments`

```sql
CREATE TABLE departments (
    id   VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE
);
```

**Example data:**

| id | name | code |
|---|---|---|
| DEPT-ICT | Information & Communication Technology | ICT |
| DEPT-ENG | Engineering | ENG |
| DEPT-HOSP | Hospitality & Tourism | HOSP |

---

### 3.3 `programmes`

```sql
CREATE TABLE programmes (
    id            VARCHAR(20) PRIMARY KEY,
    code          VARCHAR(20) NOT NULL UNIQUE,
    name          VARCHAR(150) NOT NULL,
    department_id VARCHAR(20) REFERENCES departments(id),
    is_active     BOOLEAN DEFAULT TRUE
);
```

**Example data:**

| id | code | name | department_id |
|---|---|---|---|
| PROG-DICT | DICT | Diploma in ICT | DEPT-ICT |
| PROG-DBT | DBT | Diploma in Building Tech | DEPT-ENG |
| PROG-AHBT | AHBT | Diploma in Hospitality | DEPT-HOSP |
| PROG-EE | EE | Diploma in Electrical Engineering | DEPT-ENG |

---

### 3.4 `fee_structures`

Versioned by `valid_from` / `valid_to`. Keyed on `term_number` and `scope`.
No academic year. No calendar period buckets.

```sql
CREATE TABLE fee_structures (
    id               VARCHAR(20) PRIMARY KEY,
    version_label    VARCHAR(60) NOT NULL,
    -- human-readable label e.g. "2026 Gazette", "Fee Structure v2"
    -- for admin reference only, not used in resolution logic
    term_number      INT NOT NULL CHECK (term_number IN (1, 2, 3)),
    -- the student's personal term number this structure applies to
    scope_type       VARCHAR(20) NOT NULL,
    -- 'college'    = default for all programmes
    -- 'department' = override for one department
    -- 'programme'  = override for one programme
    scope_id         VARCHAR(20),
    -- NULL for college-wide
    -- department.id or programme.id for narrower scopes
    student_category VARCHAR(30),
    -- NULL = applies to all categories
    -- 'regular' | 'kuccps' | 'nita' | 'employer' | 'self_sponsored'
    valid_from       DATE NOT NULL,
    -- first enrollment date this structure applies to
    valid_to         DATE,
    -- last enrollment date (NULL = open-ended, currently active)
    total_amount     NUMERIC(10,2) NOT NULL,
    -- computed from lines, stored for fast lookup
    is_active        BOOLEAN DEFAULT TRUE,
    created_by       VARCHAR(20) NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW(),
    UNIQUE(term_number, scope_type, scope_id, student_category, valid_from)
);
```

**Example data - v1 (current gazette, in force from 2026-01-01):**

| id | version_label | term_number | scope_type | scope_id | valid_from | valid_to | total_amount |
|---|---|---|---|---|---|---|---|
| FS-V1-T1-COL | 2026 Gazette | 1 | college | NULL | 2026-01-01 | NULL | 22398.00 |
| FS-V1-T2-COL | 2026 Gazette | 2 | college | NULL | 2026-01-01 | NULL | 22396.00 |
| FS-V1-T3-COL | 2026 Gazette | 3 | college | NULL | 2026-01-01 | NULL | 22395.00 |
| FS-V1-T1-EE  | 2026 Gazette EE | 1 | programme | PROG-EE | 2026-01-01 | NULL | 24158.00 |

**Example data - after a hypothetical fee increment announced Aug 2027:**

When the college announces new rates effective 01 Aug 2027, admin:
1. Sets `valid_to = 2027-07-31` on the v1 records
2. Creates v2 records with `valid_from = 2027-08-01`

| id | version_label | term_number | scope_type | scope_id | valid_from | valid_to | total_amount |
|---|---|---|---|---|---|---|---|
| FS-V1-T1-COL | 2026 Gazette | 1 | college | NULL | 2026-01-01 | 2027-07-31 | 22398.00 |
| FS-V1-T2-COL | 2026 Gazette | 2 | college | NULL | 2026-01-01 | 2027-07-31 | 22396.00 |
| FS-V1-T3-COL | 2026 Gazette | 3 | college | NULL | 2026-01-01 | 2027-07-31 | 22395.00 |
| FS-V2-T1-COL | 2027 Increment | 1 | college | NULL | 2027-08-01 | NULL | 24000.00 |
| FS-V2-T2-COL | 2027 Increment | 2 | college | NULL | 2027-08-01 | NULL | 23800.00 |
| FS-V2-T3-COL | 2027 Increment | 3 | college | NULL | 2027-08-01 | NULL | 23600.00 |

> Student enrolling Term 2 on 2027-07-15 → picks FS-V1-T2-COL (22,396)
> Student enrolling Term 2 on 2027-08-05 → picks FS-V2-T2-COL (23,800)
> This is entirely automatic - no admin action needed per student.

---

### 3.5 `fee_structure_lines`

Vote head amounts per fee structure. One row per vote head per structure.

```sql
CREATE TABLE fee_structure_lines (
    id               VARCHAR(20) PRIMARY KEY,
    fee_structure_id VARCHAR(20) NOT NULL REFERENCES fee_structures(id),
    vote_head_id     VARCHAR(20) NOT NULL REFERENCES vote_heads(id),
    amount           NUMERIC(10,2) NOT NULL,
    priority_order   INT NOT NULL,
    UNIQUE(fee_structure_id, vote_head_id)
);
```

**Example data - FS-V1-T1-COL (Term 1, v1 gazette, college-wide, 22,398):**

| id | fee_structure_id | vote_head_id | amount | priority_order |
|---|---|---|---|---|
| FSL-001 | FS-V1-T1-COL | VH-ACT | 1600.00 | 5 |
| FSL-002 | FS-V1-T1-COL | VH-EWC | 1324.00 | 6 |
| FSL-003 | FS-V1-T1-COL | VH-LTT | 1400.00 | 7 |
| FSL-004 | FS-V1-T1-COL | VH-PE  | 3500.00 | 8 |
| FSL-005 | FS-V1-T1-COL | VH-RMI | 1334.00 | 9 |
| FSL-006 | FS-V1-T1-COL | VH-TUI | 13240.00 | 10 |

**Example data - FS-V2-T1-COL (Term 1, v2 increment, college-wide, 24,000):**

| id | fee_structure_id | vote_head_id | amount | priority_order |
|---|---|---|---|---|
| FSL-050 | FS-V2-T1-COL | VH-ACT | 1700.00 | 5 |
| FSL-051 | FS-V2-T1-COL | VH-EWC | 1400.00 | 6 |
| FSL-052 | FS-V2-T1-COL | VH-LTT | 1500.00 | 7 |
| FSL-053 | FS-V2-T1-COL | VH-PE  | 3700.00 | 8 |
| FSL-054 | FS-V2-T1-COL | VH-RMI | 1400.00 | 9 |
| FSL-055 | FS-V2-T1-COL | VH-TUI | 14300.00 | 10 |

---

### 3.6 `student_term_enrollments`

The billing trigger. Created by Finance on receipt of an enrollment event from
the Academics service. Locks the fee structure at the moment of enrollment.

```sql
CREATE TABLE student_term_enrollments (
    id               VARCHAR(20) PRIMARY KEY,

    -- Who
    student_id       VARCHAR(20) NOT NULL,
    programme_id     VARCHAR(20) NOT NULL REFERENCES programmes(id),

    -- Personal academic position (sent by Academics service)
    student_year     INT NOT NULL,     -- 1, 2, 3 ... (personal year counter)
    student_term     INT NOT NULL,     -- 1, 2, or 3 (resets each personal year)

    -- Fee resolution (locked at enrollment time - never changes after)
    fee_structure_id VARCHAR(20) NOT NULL REFERENCES fee_structures(id),
    -- The exact fee structure version active on enrollment_date
    -- fee_structure.version_label is for human reference
    -- fee_structure.valid_from/valid_to show which gazette this came from

    -- Context
    student_category VARCHAR(30) NOT NULL,
    is_new_student   BOOLEAN DEFAULT FALSE,
    enrollment_date  DATE NOT NULL,
    enrolled_by      VARCHAR(20) NOT NULL,
    source_event_id  VARCHAR(80) UNIQUE,
    -- eventId from Academics service - idempotency key
    status           VARCHAR(20) DEFAULT 'active',
    -- active | completed | withdrawn | deferred
    notes            TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),

    UNIQUE(student_id, student_year, student_term)
    -- a student can only have one enrollment per personal term
);
```

**Example data - multiple students, different personal positions, same real-world dates:**

| id | student_id | programme_id | student_year | student_term | fee_structure_id | enrollment_date | is_new_student |
|---|---|---|---|---|---|---|---|
| STE-001 | S12345 | PROG-DICT | 1 | 1 | FS-V1-T1-COL | 2026-01-08 | true |
| STE-002 | S12346 | PROG-DICT | 1 | 2 | FS-V1-T2-COL | 2026-01-10 | false |
| STE-003 | S12347 | PROG-EE   | 1 | 1 | FS-V1-T1-EE  | 2026-01-12 | true |
| STE-004 | S12345 | PROG-DICT | 1 | 2 | FS-V1-T2-COL | 2026-09-05 | false |
| STE-005 | S12345 | PROG-DICT | 1 | 3 | FS-V2-T3-COL | 2027-09-08 | false |

> STE-001 and STE-002: same programme, same January 2026 week.
> S12345 is at Term 1 → FS-V1-T1-COL → 22,398
> S12346 is at Term 2 → FS-V1-T2-COL → 22,396
> Different personal terms → different fees. Correct.
>
> STE-005: S12345 returns Sep 2027 for Term 3.
> By then v2 is active (valid_from 2027-08-01).
> Term 3 fee = 23,600 (v2 rates). Correct.

---

### 3.7 `fee_obligations`

One per enrollment event. The live balance. New students get two rows -
one `term` obligation and one `one_time` obligation.

```sql
CREATE TABLE fee_obligations (
    id               VARCHAR(20) PRIMARY KEY,
    enrollment_id    VARCHAR(20) NOT NULL REFERENCES student_term_enrollments(id),
    student_id       VARCHAR(20) NOT NULL,
    programme_id     VARCHAR(20) NOT NULL REFERENCES programmes(id),
    student_year     INT NOT NULL,
    student_term     INT NOT NULL,
    obligation_type  VARCHAR(20) NOT NULL DEFAULT 'term',
    -- 'term'     = recurring per-term fee
    -- 'one_time' = new student charges (Admission, ID, Caution, KUCCPS)
    total_amount     NUMERIC(10,2) NOT NULL,
    total_paid       NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_balance    NUMERIC(10,2) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    -- unpaid | partial | cleared | overpaid
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);
```

**Example data:**

| id | enrollment_id | student_id | student_year | student_term | obligation_type | total_amount | total_paid | total_balance | status |
|---|---|---|---|---|---|---|---|---|---|
| OBL-001 | STE-001 | S12345 | 1 | 1 | one_time | 3550.00 | 3550.00 | 0.00 | cleared |
| OBL-002 | STE-001 | S12345 | 1 | 1 | term | 22398.00 | 25000.00 | -2602.00 | overpaid |
| OBL-003 | STE-002 | S12346 | 1 | 2 | term | 22396.00 | 22396.00 | 0.00 | cleared |
| OBL-004 | STE-004 | S12345 | 1 | 2 | term | 22396.00 | 2602.00 | 19794.00 | partial |
| OBL-005 | STE-005 | S12345 | 1 | 3 | term | 23600.00 | 0.00 | 23600.00 | unpaid |

> OBL-002: S12345 overpaid Term 1 by 2,602. Credit stored.
> OBL-004: When S12345 enrolled for Term 2 (STE-004), Finance auto-applied
>   the 2,602 credit. OBL-004 opens at 22,396 - 2,602 = 19,794 already partial.
> OBL-005: S12345 Term 3 in Sep 2027. v2 rates apply. Total = 23,600.

---

### 3.8 `obligation_vote_head_snapshots`

Amounts frozen at obligation creation. Receipts always read from here.
Changing the fee structure or vote head names later does not affect these rows.

```sql
CREATE TABLE obligation_vote_head_snapshots (
    id              VARCHAR(20) PRIMARY KEY,
    obligation_id   VARCHAR(20) NOT NULL REFERENCES fee_obligations(id),
    vote_head_id    VARCHAR(20) NOT NULL REFERENCES vote_heads(id),
    vote_head_name  VARCHAR(100) NOT NULL,
    -- denormalized - survives future vote head renames
    amount_assessed NUMERIC(10,2) NOT NULL,
    -- frozen at obligation creation - never modified
    priority_order  INT NOT NULL,
    UNIQUE(obligation_id, vote_head_id)
);
```

**Example data - OBL-002 (S12345, Term 1, v1 rates, 22,398):**

| id | obligation_id | vote_head_name | amount_assessed | priority_order |
|---|---|---|---|---|
| SNAP-001 | OBL-002 | Activity | 1600.00 | 5 |
| SNAP-002 | OBL-002 | Electricity, Water & Conservancy | 1324.00 | 6 |
| SNAP-003 | OBL-002 | Local Travel & Transport | 1400.00 | 7 |
| SNAP-004 | OBL-002 | Personal Emoluments | 3500.00 | 8 |
| SNAP-005 | OBL-002 | R.M.I | 1334.00 | 9 |
| SNAP-006 | OBL-002 | Tuition | 13240.00 | 10 |

**Example data - OBL-005 (S12345, Term 3, v2 rates, 23,600):**

| id | obligation_id | vote_head_name | amount_assessed | priority_order |
|---|---|---|---|---|
| SNAP-030 | OBL-005 | Activity | 1700.00 | 5 |
| SNAP-031 | OBL-005 | Electricity, Water & Conservancy | 1400.00 | 6 |
| SNAP-032 | OBL-005 | Local Travel & Transport | 1500.00 | 7 |
| SNAP-033 | OBL-005 | Personal Emoluments | 3700.00 | 8 |
| SNAP-034 | OBL-005 | R.M.I | 1400.00 | 9 |
| SNAP-035 | OBL-005 | Tuition | 14300.00 | 10 |

> Same student, different term, different fee version.
> Snapshots record exactly what each obligation was charged at.
> Receipts reprinted years later will always show the correct historical amounts.

**Example data - OBL-001 (one-time charges, new student):**

| id | obligation_id | vote_head_name | amount_assessed | priority_order |
|---|---|---|---|---|
| SNAP-007 | OBL-001 | Admission Fee | 500.00 | 1 |
| SNAP-008 | OBL-001 | Student ID | 500.00 | 2 |
| SNAP-009 | OBL-001 | Caution Money | 1000.00 | 3 |
| SNAP-010 | OBL-001 | KUCCPS Registration | 1550.00 | 4 |

---

### 3.9 `payments`

One immutable row per transaction.

```sql
CREATE TABLE payments (
    id              VARCHAR(20) PRIMARY KEY,
    student_id      VARCHAR(20) NOT NULL,
    receipt_number  VARCHAR(30) NOT NULL UNIQUE,
    total_amount    NUMERIC(10,2) NOT NULL,
    payment_mode    VARCHAR(20) NOT NULL,
    -- cash | mpesa | bank_transfer | cheque | credit_transfer
    transaction_ref VARCHAR(100),
    funding_source  VARCHAR(30) NOT NULL,
    -- self | kuccps | nita | helb | employer
    -- cdf_bursary | county_bursary | carry_forward
    helb_band       VARCHAR(10),
    -- NULL for non-HELB; 'band1'..'band5'
    sponsor_name    VARCHAR(100),
    received_by     VARCHAR(20) NOT NULL,
    -- 'SYSTEM' for automatic credit carry-forward payments
    is_reversal     BOOLEAN DEFAULT FALSE,
    reversal_of     VARCHAR(20) REFERENCES payments(id),
    payment_date    DATE NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);
```

**Example data:**

| id | student_id | receipt_number | total_amount | payment_mode | funding_source | received_by | is_reversal |
|---|---|---|---|---|---|---|---|
| PMT-001 | S12345 | RCP-2026-0001 | 3550.00 | cash | self | USR-CASH-01 | false |
| PMT-002 | S12345 | RCP-2026-0002 | 22000.00 | bank_transfer | kuccps | USR-CASH-01 | false |
| PMT-003 | S12345 | RCP-2026-0003 | 3000.00 | mpesa | self | USR-CASH-01 | false |
| PMT-004 | S12345 | SYS-2026-0001 | 2602.00 | credit_transfer | carry_forward | SYSTEM | false |

> PMT-004: system-generated credit payment when S12345 enrolled for Term 2.
> The 2,602 overpayment from Term 1 was auto-applied to OBL-004.

---

### 3.10 `payment_distributions`

Written at receipt generation time. Waterfall result - how each payment was
split across vote heads. Reads from snapshots, never from live fee structures.

```sql
CREATE TABLE payment_distributions (
    id             VARCHAR(20) PRIMARY KEY,
    payment_id     VARCHAR(20) NOT NULL REFERENCES payments(id),
    obligation_id  VARCHAR(20) NOT NULL REFERENCES fee_obligations(id),
    vote_head_id   VARCHAR(20) NOT NULL REFERENCES vote_heads(id),
    amount_applied NUMERIC(10,2) NOT NULL
);
```

**Example data - PMT-002 (22,000 against OBL-002, waterfall through v1 snapshots):**

Waterfall: ACT(1,600) → EWC(1,324) → LTT(1,400) → PE(3,500) → RMI(1,334)
→ TUI gets remainder: 22,000 - 9,158 = 12,842

| id | payment_id | obligation_id | vote_head_id | amount_applied |
|---|---|---|---|---|
| DST-001 | PMT-002 | OBL-002 | VH-ACT | 1600.00 |
| DST-002 | PMT-002 | OBL-002 | VH-EWC | 1324.00 |
| DST-003 | PMT-002 | OBL-002 | VH-LTT | 1400.00 |
| DST-004 | PMT-002 | OBL-002 | VH-PE  | 3500.00 |
| DST-005 | PMT-002 | OBL-002 | VH-RMI | 1334.00 |
| DST-006 | PMT-002 | OBL-002 | VH-TUI | 12842.00 |

---

### 3.11 `student_credits`

Overpayment carry-forward. One row per student. Consumed on next enrollment event.

```sql
CREATE TABLE student_credits (
    id                   VARCHAR(20) PRIMARY KEY,
    student_id           VARCHAR(20) NOT NULL UNIQUE,
    amount               NUMERIC(10,2) NOT NULL DEFAULT 0,
    source_obligation_id VARCHAR(20) REFERENCES fee_obligations(id),
    -- most recent obligation that generated or last updated this credit
    updated_at           TIMESTAMP DEFAULT NOW()
);
```

**Example data:**

| id | student_id | amount | source_obligation_id | updated_at |
|---|---|---|---|---|
| CRED-001 | S12345 | 0.00 | OBL-002 | 2026-09-05 |
| CRED-002 | S12346 | 5000.00 | OBL-003 | 2027-01-10 |

> CRED-001: S12345 generated 2,602 from Term 1 overpayment.
>   Consumed when Term 2 enrolled. Amount = 0 now.
> CRED-002: S12346 cleared OBL-003 and paid 5,000 extra.
>   5,000 sits here until they enroll for Term 3.

---

### 3.12 `helb_assessments`

HELB band classification per student. Linked to the year of assessment,
not the student's personal term position.

```sql
CREATE TABLE helb_assessments (
    id              VARCHAR(20) PRIMARY KEY,
    student_id      VARCHAR(20) NOT NULL,
    assessment_year INT NOT NULL,
    -- calendar year the HELB assessment was done
    band            INT NOT NULL CHECK (band BETWEEN 1 AND 5),
    scholarship_pct NUMERIC(5,2) NOT NULL,
    loan_pct        NUMERIC(5,2) NOT NULL,
    household_pct   NUMERIC(5,2) NOT NULL,
    scholarship_amt NUMERIC(10,2) NOT NULL,
    loan_amt        NUMERIC(10,2) NOT NULL,
    household_amt   NUMERIC(10,2) NOT NULL,
    upkeep_amt      NUMERIC(10,2) NOT NULL,
    assessed_date   DATE NOT NULL,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, assessment_year)
);
```

**Example data:**

| id | student_id | assessment_year | band | scholarship_amt | loan_amt | household_amt | upkeep_amt |
|---|---|---|---|---|---|---|---|
| HELB-001 | S12347 | 2026 | 3 | 33595.00 | 21500.00 | 12094.00 | 15600.00 |

---

### 3.13 `audit_logs`

Every financial and system action recorded.

```sql
CREATE TABLE audit_logs (
    id          VARCHAR(20) PRIMARY KEY,
    user_id     VARCHAR(20) NOT NULL,
    -- 'SYSTEM' for automated actions
    action      VARCHAR(80) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    entity_id   VARCHAR(20) NOT NULL,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT NOW()
);
```

**Example data:**

| id | user_id | action | entity_type | entity_id | created_at |
|---|---|---|---|---|---|
| AUD-001 | HOD-001 | ENROLLMENT_EVENT_RECEIVED | enrollment | STE-001 | 2026-01-08 08:30:00 |
| AUD-002 | SYSTEM | FEE_STRUCTURE_RESOLVED | fee_structure | FS-V1-T1-COL | 2026-01-08 08:30:00 |
| AUD-003 | SYSTEM | OBLIGATION_CREATED | obligation | OBL-002 | 2026-01-08 08:30:01 |
| AUD-004 | SYSTEM | SNAPSHOT_CREATED | obligation | OBL-002 | 2026-01-08 08:30:01 |
| AUD-005 | USR-CASH-01 | PAYMENT_POSTED | payment | PMT-002 | 2026-01-08 10:15:00 |
| AUD-006 | SYSTEM | CREDIT_CREATED | credit | CRED-001 | 2026-01-08 10:15:01 |
| AUD-007 | HOD-001 | ENROLLMENT_EVENT_RECEIVED | enrollment | STE-004 | 2026-09-05 09:00:00 |
| AUD-008 | SYSTEM | CREDIT_CONSUMED | credit | CRED-001 | 2026-09-05 09:00:01 |
| AUD-009 | ADMIN-01 | FEE_STRUCTURE_VERSION_CLOSED | fee_structure | FS-V1-T1-COL | 2027-07-15 14:00:00 |
| AUD-010 | ADMIN-01 | FEE_STRUCTURE_VERSION_CREATED | fee_structure | FS-V2-T1-COL | 2027-07-15 14:00:01 |

---

### 3.14 DORMANT - `module_fee_structures` + `module_fee_lines`

These tables exist for future per-module billing. No current code touches them.
Activating them requires: populating data, adding `module_code` to enrollment
events, and enabling a feature flag in the enrollment handler. Everything
downstream (snapshots, waterfall, receipts) works without change.

```sql
-- DORMANT: per-module billing. No business logic reads or writes these.

CREATE TABLE module_fee_structures (
    id               VARCHAR(20) PRIMARY KEY,
    module_code      VARCHAR(30) NOT NULL,
    programme_id     VARCHAR(20) REFERENCES programmes(id),
    term_number      INT NOT NULL CHECK (term_number IN (1, 2, 3)),
    scope_type       VARCHAR(20) NOT NULL,
    scope_id         VARCHAR(20),
    student_category VARCHAR(30),
    valid_from       DATE NOT NULL,
    valid_to         DATE,
    total_amount     NUMERIC(10,2) NOT NULL,
    is_active        BOOLEAN DEFAULT TRUE,
    created_by       VARCHAR(20) NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW(),
    UNIQUE(module_code, term_number, scope_type, scope_id, student_category, valid_from)
);

CREATE TABLE module_fee_lines (
    id                      VARCHAR(20) PRIMARY KEY,
    module_fee_structure_id VARCHAR(20) NOT NULL REFERENCES module_fee_structures(id),
    vote_head_id            VARCHAR(20) NOT NULL REFERENCES vote_heads(id),
    amount                  NUMERIC(10,2) NOT NULL,
    priority_order          INT NOT NULL,
    UNIQUE(module_fee_structure_id, vote_head_id)
);
```

---

### 3.15 Complete Table Summary

| # | Table | Status | Purpose |
|---|---|---|---|
| 01 | `vote_heads` | Active | Configurable fee categories |
| 02 | `departments` | Active | Department grouping for cascade |
| 03 | `programmes` | Active | Programme/course registry |
| 04 | `fee_structures` | Active | Versioned fee rates (valid_from/valid_to + term_number + scope) |
| 05 | `fee_structure_lines` | Active | Vote head amounts per structure version |
| 06 | `student_term_enrollments` | Active | Billing trigger - personal term record, fee version locked |
| 07 | `fee_obligations` | Active | Live balance per enrollment |
| 08 | `obligation_vote_head_snapshots` | Active | Frozen amounts at obligation creation |
| 09 | `payments` | Active | Immutable payment records |
| 10 | `payment_distributions` | Active | Vote head allocation per payment (written at receipt time) |
| 11 | `student_credits` | Active | Overpayment carry-forward |
| 12 | `helb_assessments` | Active | HELB band per student per assessment year |
| 13 | `audit_logs` | Active | Every financial and system action |
| 14 | `module_fee_structures` | **Dormant** | Per-module billing (future) |
| 15 | `module_fee_lines` | **Dormant** | Vote head amounts per module (future) |

**15 tables. 13 active. 2 dormant.**

---

## 4. Fee Structure Resolution

### 4.1 The Resolution Query

```sql
SELECT fs.id, fs.version_label, fs.scope_type, fs.total_amount
FROM   fee_structures fs
WHERE  fs.term_number   = :student_term
AND    fs.is_active     = TRUE
AND    fs.valid_from   <= :enrollment_date
AND   (fs.valid_to     >= :enrollment_date OR fs.valid_to IS NULL)
AND   (fs.student_category = :student_category OR fs.student_category IS NULL)
AND   (
        (fs.scope_type = 'programme'  AND fs.scope_id = :programme_id)
     OR (fs.scope_type = 'department' AND fs.scope_id = :department_id)
     OR (fs.scope_type = 'college')
      )
ORDER BY
  CASE fs.scope_type
    WHEN 'programme'  THEN 1   -- most specific wins
    WHEN 'department' THEN 2
    WHEN 'college'    THEN 3
  END
LIMIT 1;
```

**What the inputs are:**

| Input | Source |
|---|---|
| `:student_term` | Sent by Academics in the enrollment event |
| `:enrollment_date` | Sent by Academics in the enrollment event |
| `:programme_id` | Resolved from `programmeCode` in the event |
| `:department_id` | Resolved from programme's department |
| `:student_category` | Sent by Academics in the enrollment event |

No academic year variable. No calendar window lookup. The date itself handles versioning.

### 4.2 Version Transition - What Admin Does

When the college announces a fee increment:

```
1. Admin sets valid_to on all current active structures
   e.g. UPDATE fee_structures SET valid_to = '2027-07-31'
        WHERE valid_to IS NULL AND version_label = '2026 Gazette'

2. Admin creates new fee structures with valid_from = new effective date
   e.g. INSERT fee_structures (version_label='2027 Increment',
        term_number=1, scope_type='college', valid_from='2027-08-01', ...)

3. Admin adds fee_structure_lines to each new structure

4. Done. No student records touched. No obligations changed.
   All future enrollments on or after 2027-08-01 pick up new rates automatically.
```

The UI should provide a **"Create new version"** button that pre-fills the new
structure from the current active one, so admin only changes what differs.

### 4.3 Cascade Diagram

```
Enrolling a student with term_number=1 on date=2026-03-15:

  Active fee structures for term=1 on 2026-03-15:
    FS-V1-T1-COL  scope=college  (valid 2026-01-01 → NULL)
    FS-V1-T1-EE   scope=programme PROG-EE  (valid 2026-01-01 → NULL)

  For DICT student:
    Check programme → no DICT-specific structure → skip
    Check department → no ICT-specific structure → skip
    Check college → FS-V1-T1-COL found → USE (22,398)

  For EE student:
    Check programme → FS-V1-T1-EE found → USE (24,158)
```

---

## 5. Inter-Service Integration

### 5.1 Enrollment Event Endpoint

```
POST /api/finance/enrollment-events
```

**Request body:**

```json
{
  "event":           "TERM_ADVANCED",
  "eventId":         "EVT-20260910-S12345-Y1T2",
  "studentId":       "S12345",
  "programmeCode":   "DICT",
  "studentYear":     1,
  "studentTerm":     2,
  "enrollmentDate":  "2026-09-05",
  "studentCategory": "regular",
  "isNewStudent":    false,
  "enrolledBy":      "HOD-001"
}
```

**How Finance uses it:**

```
studentTerm = 2          → look up fee structures with term_number = 2
enrollmentDate = 2026-09-05 → fee structure valid on this date
programmeCode = DICT     → resolve programme_id + department_id
                         → cascade: programme → department → college
```

**Successful response:**

```json
{
  "success": true,
  "data": {
    "enrollmentId": "STE-004",
    "feeStructureApplied": {
      "id":           "FS-V1-T2-COL",
      "versionLabel": "2026 Gazette",
      "scopeType":    "college",
      "validFrom":    "2026-01-01",
      "validTo":      null,
      "totalAmount":  22396.00
    },
    "obligations": [
      {
        "id":            "OBL-004",
        "type":          "term",
        "studentYear":   1,
        "studentTerm":   2,
        "totalAmount":   22396.00,
        "totalPaid":     2602.00,
        "totalBalance":  19794.00,
        "status":        "partial",
        "creditApplied": 2602.00
      }
    ],
    "creditApplied":   2602.00,
    "creditRemaining": 0.00
  }
}
```

**Error - no fee structure configured for this term + date:**

```json
{
  "success": false,
  "error":   "No active fee structure found for term_number=2 on date=2026-09-05 for programme=DICT. Configure a fee structure before advancing this student.",
  "code":    "FEE_STRUCTURE_NOT_FOUND"
}
```

**Supported event types:**

| event | Finance action |
|---|---|
| `TERM_ADVANCED` | Resolve fee → create enrollment + obligation + snapshot → apply credit |
| `STUDENT_WITHDRAWN` | Mark enrollment `withdrawn`. Obligation unchanged. |
| `STUDENT_DEFERRED` | Mark enrollment `deferred`. Obligation unchanged. |
| `STUDENT_REINSTATED` | Reactivate enrollment. No new obligation created. |

### 5.2 Idempotency

`source_event_id` has a UNIQUE constraint. If Academics retries the same
`eventId`, Finance returns the existing enrollment record without creating
duplicates.

### 5.3 What Academics Does on Error

```
FEE_STRUCTURE_NOT_FOUND (404)
  → Do NOT advance student in Academics
  → Show HOD: "Finance has not configured fees for this term. Contact finance office."
  → Once admin configures, HOD retries

503 / Network error
  → Retry up to 3 times with exponential backoff
  → If all fail: queue the event, show HOD a pending status
  → Retry automatically when Finance recovers
```

---

## 6. Enrollment Event Processing (Step by Step)

```
RECEIVE: POST /api/finance/enrollment-events { TERM_ADVANCED }

1.  Check source_event_id uniqueness
    → If already exists: return existing enrollment response (idempotent, stop)

2.  Resolve programme_id from programmeCode
    → Not found: return error

3.  Resolve fee structure:
    SELECT from fee_structures WHERE
      term_number   = event.studentTerm
      valid_from   <= event.enrollmentDate
      valid_to     >= event.enrollmentDate OR valid_to IS NULL
      scope cascade: programme → department → college
      student_category match
    → Not found: return FEE_STRUCTURE_NOT_FOUND error, STOP

4.  BEGIN TRANSACTION

5.  INSERT student_term_enrollments
      student_year     = event.studentYear
      student_term     = event.studentTerm
      fee_structure_id = resolved above (LOCKED)
      enrollment_date  = event.enrollmentDate
      source_event_id  = event.eventId

6.  INSERT fee_obligation (type = 'term')
      total_amount  = fee_structure.total_amount
      total_paid    = 0
      total_balance = total_amount
      status        = 'unpaid'

7.  INSERT obligation_vote_head_snapshots
      Copy each fee_structure_line:
        vote_head_id   = line.vote_head_id
        vote_head_name = vote_heads.name  (denormalized)
        amount_assessed = line.amount     (frozen)
        priority_order  = line.priority_order

8.  If event.isNewStudent = TRUE:
      Check: SELECT COUNT(*) FROM fee_obligations
             WHERE student_id = :id AND obligation_type = 'one_time'
      If count = 0:
        INSERT fee_obligation (type = 'one_time', total = 3,550)
        INSERT snapshots for one-time vote heads:
          Admission Fee 500 | Student ID 500 | Caution Money 1,000 | KUCCPS Reg 1,550

9.  Check student_credits:
      SELECT amount FROM student_credits WHERE student_id = :id
      IF amount > 0:
        creditToUse = MIN(amount, term_obligation.total_amount)
        INSERT payment (payment_mode='credit_transfer',
                        funding_source='carry_forward', received_by='SYSTEM',
                        total_amount=creditToUse)
        UPDATE fee_obligation: total_paid += creditToUse
                               total_balance -= creditToUse
                               status = recalculate
        UPDATE student_credits: amount -= creditToUse
        INSERT audit_log: CREDIT_CONSUMED

10. INSERT audit_logs:
      ENROLLMENT_EVENT_RECEIVED
      FEE_STRUCTURE_RESOLVED
      OBLIGATION_CREATED
      SNAPSHOT_CREATED

11. COMMIT TRANSACTION

12. RETURN enrollment + obligations + credit summary
```

---

## 7. Payment Flow

### 7.1 Posting a Payment

```json
POST /api/payments
{
  "studentId":      "S12345",
  "obligations":    [{ "obligationId": "OBL-004", "amount": 10000 }],
  "totalAmount":    10000,
  "paymentMode":    "mpesa",
  "transactionRef": "QXZ999XYZ",
  "fundingSource":  "self",
  "receivedBy":     "USR-CASH-01",
  "paymentDate":    "2026-09-10"
}
```

On posting:
- `payments` row inserted (immutable)
- `fee_obligations.total_paid` += amount
- `fee_obligations.total_balance` -= amount
- `fee_obligations.status` updated
- If `total_balance < 0`: excess → `student_credits`
- Audit log written
- `payment_distributions` NOT written yet

### 7.2 Receipt Generation (Waterfall)

```
POST /api/receipts/:obligationId/generate
```

1. Load `obligation_vote_head_snapshots` for this obligation
2. Compute net paid from all non-reversed payments for this obligation
3. Walk snapshots in `priority_order` ASC - fill each until money runs out
4. Write `payment_distributions` (delete previous first - idempotent)
5. Return full receipt with vote head breakdown

Receipts always reflect the snapshot amounts - never the live fee structure.
Historical reprints are always accurate.

### 7.3 Reversal

```
POST /api/payments/:id/reverse
{
  "obligations": [{ "obligationId": "OBL-004", "amount": 10000 }],
  "reversedBy":  "ADMIN-01"
}
```

- New `payments` row created with `is_reversal = true`
- Obligation balance reversed
- Existing distributions deleted (recomputed on next receipt generation)
- Original payment row untouched - both rows permanent forever

---

## 8. Key Rules

| Rule | Detail |
|---|---|
| **Personal term drives structure lookup** | `term_number` from Academics event selects which fee structure to use |
| **Enrollment date drives version** | The date picks which gazette/version of that structure was active |
| **No academic year bucket** | `academic_year` does not exist as a key - date + term_number is sufficient |
| **Fee structure locked at enrollment** | `fee_structure_id` on the enrollment record never changes |
| **Snapshots are immutable** | Vote head amounts copied at obligation creation, frozen permanently |
| **Payments are immutable** | No editing - reversals only |
| **Credit auto-applies** | Consumed on every TERM_ADVANCED event before returning the obligation |
| **Version change is forward-only** | Setting `valid_to` closes a version. Existing obligations are unaffected. |
| **One-time charges once ever** | System checks for prior `one_time` obligation regardless of `isNewStudent` flag |
| **Idempotent events** | Same `eventId` safe to retry - no duplicates created |
| **Module tables dormant** | Exist in schema, no code touches them |
| **Gaps between terms are fine** | A student returning 3 years later is handled identically to one returning next month |

---

## 9. Student Fee Position Response

```
GET /api/students/S12345/fee-position?studentYear=1
```

```json
{
  "studentId":   "S12345",
  "programme":   "DICT",
  "studentYear": 1,
  "obligations": [
    {
      "type":        "one_time",
      "label":       "New Student Charges",
      "totalAmount": 3550.00,
      "totalPaid":   3550.00,
      "totalBalance": 0.00,
      "status":      "cleared",
      "feeVersion":  "Policy 2026",
      "voteHeads": [
        { "name": "Admission Fee",       "assessed": 500.00,  "paid": 500.00,  "balance": 0.00,  "status": "cleared" },
        { "name": "Student ID",          "assessed": 500.00,  "paid": 500.00,  "balance": 0.00,  "status": "cleared" },
        { "name": "Caution Money",       "assessed": 1000.00, "paid": 1000.00, "balance": 0.00,  "status": "cleared" },
        { "name": "KUCCPS Registration", "assessed": 1550.00, "paid": 1550.00, "balance": 0.00,  "status": "cleared" }
      ]
    },
    {
      "type":             "term",
      "studentTerm":      1,
      "enrollmentDate":   "2026-01-08",
      "feeVersion":       "2026 Gazette",
      "feeVersionValidFrom": "2026-01-01",
      "feeScope":         "college",
      "totalAmount":      22398.00,
      "totalPaid":        25000.00,
      "totalBalance":     -2602.00,
      "status":           "overpaid",
      "creditGenerated":  2602.00,
      "voteHeads": [
        { "name": "Activity",                        "assessed": 1600.00,  "paid": 1600.00,  "balance": 0.00,   "status": "cleared" },
        { "name": "Electricity, Water & Conservancy","assessed": 1324.00,  "paid": 1324.00,  "balance": 0.00,   "status": "cleared" },
        { "name": "Local Travel & Transport",        "assessed": 1400.00,  "paid": 1400.00,  "balance": 0.00,   "status": "cleared" },
        { "name": "Personal Emoluments",             "assessed": 3500.00,  "paid": 3500.00,  "balance": 0.00,   "status": "cleared" },
        { "name": "R.M.I",                           "assessed": 1334.00,  "paid": 1334.00,  "balance": 0.00,   "status": "cleared" },
        { "name": "Tuition",                         "assessed": 13240.00, "paid": 12842.00, "balance": 398.00, "status": "partial" }
      ]
    },
    {
      "type":            "term",
      "studentTerm":     2,
      "enrollmentDate":  "2026-09-05",
      "feeVersion":      "2026 Gazette",
      "feeVersionValidFrom": "2026-01-01",
      "feeScope":        "college",
      "totalAmount":     22396.00,
      "totalPaid":       2602.00,
      "totalBalance":    19794.00,
      "status":          "partial",
      "creditApplied":   2602.00
    },
    {
      "type":            "term",
      "studentTerm":     3,
      "enrollmentDate":  "2027-09-08",
      "feeVersion":      "2027 Increment",
      "feeVersionValidFrom": "2027-08-01",
      "feeScope":        "college",
      "totalAmount":     23600.00,
      "totalPaid":       0.00,
      "totalBalance":    23600.00,
      "status":          "unpaid"
    }
  ],
  "summary": {
    "termFeesTotal":   68394.00,
    "oneTimeTotal":    3550.00,
    "grandTotal":      71944.00,
    "totalPaid":       31152.00,
    "totalBalance":    40792.00,
    "creditOnAccount": 0.00
  }
}
```

> Term 3 shows v2 rates (23,600) because S12345 enrolled Sep 2027,
> after the 2027 Increment took effect. Terms 1 and 2 show v1 rates
> because they enrolled before Aug 2027. Each term is independently
> and correctly versioned.

---

## 10. Edge Cases

| Scenario | Behaviour |
|---|---|
| Two students at different personal terms enroll same day | Each gets their own `term_number` matched fee structure. Different amounts. Correct. |
| Student returns 3 years later for Term 2 | Enrollment event arrives with `studentTerm=2`. Resolution picks whatever fee version is active on that enrollment date. Gap is irrelevant. |
| No fee structure active on enrollment date | `FEE_STRUCTURE_NOT_FOUND` returned. Academics does not advance student. Admin must configure. |
| Fee increment announced - when does it take effect? | Admin sets `valid_from` on new version to the college's announced effective date. Can be future-dated - students who enroll before that date still get old rates. |
| Admin creates v2 but forgets to close v1 | UNIQUE constraint on `(term_number, scope_type, scope_id, student_category, valid_from)` prevents duplicate entries. Overlapping `valid_from/valid_to` should be caught by a validation rule in the service layer: no two active structures for the same scope+term should have overlapping date ranges. |
| Same event arrives twice | `source_event_id` UNIQUE constraint. Returns existing enrollment. No duplicate obligation. |
| Student overpays Term 2; credit exceeds Term 3 fee | `MIN(credit, obligation_total)` applied. Remainder stays in `student_credits` for Year 2 Term 1. |
| Admin changes fee amounts on an active structure after obligations exist | Admin warned that obligations exist. Change is allowed but only affects future enrollments. Existing snapshots untouched. |
| Vote head renamed | `vote_head_name` in snapshots is denormalized. Old receipts still show original name. |
| Module billing activated in future | Populate dormant tables. Add `moduleCode` to enrollment events. Feature-flag the lookup in enrollment handler. Existing obligations unaffected. |
| Student at Term 3 Year 1 - what happens next? | Academics sends `studentYear=2, studentTerm=1` on next return. Finance creates a fresh enrollment and obligation. The personal year/term counter resets. |
