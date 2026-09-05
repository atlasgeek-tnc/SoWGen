# Agent Workflow — Transcript to SOW

This document defines the exact sequence of steps the agent follows when processing inputs. Follow this workflow precisely for every engagement.

---

## Overview

```
INPUT (Transcript + Docs)
        │
        ▼
  STAGE 1: ANALYSIS
  ─────────────────
  1. Ingest & Parse Inputs
  2. Extract Requirements
  3. Identify Gaps & Risks
        │
        ▼
  STAGE 2: PRD GENERATION
  ────────────────────────
  4. Populate PRD Template
  5. Flag Open Questions
  6. Internal Review Check
        │
        ▼
  STAGE 3: SOW GENERATION
  ────────────────────────
  7. Map PRD → SOW Sections
  8. Draft SOW
  9. Quality Gate Check
        │
        ▼
  OUTPUT (PRD + SOW + Logs)
```

---

## Stage 1: Input Analysis

### Step 1 — Ingest & Classify Inputs

For each document provided:

| Action | Detail |
|---|---|
| Identify document type | Transcript / RFP / Architecture Diagram / Contract / Email |
| Extract date and participants | For transcripts: who spoke, what role |
| Note document version | For RFPs or contracts |
| Flag conflicting documents | If two sources contradict, flag immediately |

**Transcript-Specific Parsing:**
- Tag each speaker by role (e.g., `[CLIENT - CTO]`, `[PROVIDER - SA]`)
- Note timestamps for significant statements
- Mark sections where client is speculative vs. definitive ("we think" vs. "we need")

---

### Step 2 — Requirements Extraction

Work through the transcript systematically and extract:

**Functional Requirements**
- What must the solution do?
- What workflows, integrations, or features were mentioned?

**Non-Functional Requirements**
- Performance targets (latency, throughput, uptime SLA)
- Security and compliance mandates
- Scalability expectations
- DR/BCP requirements (RPO/RTO)

**Constraints**
- Budget ceiling (if mentioned — even informally)
- Mandated technology choices
- Timeline deadlines (regulatory, board, market)
- Geographic or data residency requirements

**Soft Signals to Capture**
- Urgency indicators ("we need this done before Q4")
- Political constraints ("our CTO doesn't want to use vendor X")
- Budget sensitivity ("we can't go over budget again")
- Prior bad experiences ("our last implementation failed because...")

---

### Step 3 — Gap & Risk Identification

Before moving to the PRD, run these checks:

**Completeness Check**
- [ ] Is the problem statement clear?
- [ ] Are success criteria defined or inferable?
- [ ] Is a timeline mentioned?
- [ ] Is a budget range mentioned (even informally)?
- [ ] Are integration points with existing systems identified?
- [ ] Are named third-party vendors or platforms mentioned?

**Risk Flags**
- [ ] Unrealistic timeline vs. scope
- [ ] Undefined client resource availability
- [ ] Ambiguous ownership of key decisions
- [ ] Compliance requirements without existing controls
- [ ] Legacy system dependencies not yet assessed
- [ ] Multi-cloud complexity with no existing cloud ops capability

**Scope Creep Indicators**
- Watch for "and also…", "while you're at it…", "we'd love if…" — these are often out-of-scope items
- Document them in the Open Questions Log, not in the PRD scope section

---

## Stage 2: PRD Generation

### Step 4 — Populate the PRD

Use `prd-template.md` as the structure. Fill every section:

**Priority Order for Population:**
1. Executive Summary — set the context first
2. Client Context — who they are and what their environment looks like
3. Requirements (FR + NFR) — the core of the document
4. Scope In/Out — protect the engagement boundaries
5. Assumptions — document what you're taking on trust
6. Dependencies — what must be true for delivery to work
7. Open Questions — what must be resolved before SOW sign-off
8. Risks — likelihood/impact assessment

**MoSCoW Prioritisation Rules:**
- **Must Have:** Without this, the project fails or the client has no value
- **Should Have:** High value, included unless time/cost forces exclusion
- **Could Have:** Nice to have, clearly secondary
- **Won't Have (this phase):** Explicitly out of scope, often deferred

---

### Step 5 — Open Questions Log

Generate the Open Questions Log in parallel with the PRD. Include:

- Every assumption that could not be confirmed from the transcript
- Every technical detail needed for accurate estimation
- Every commercial or legal question
- Every client obligation that was not confirmed

> **Rule:** If you cannot write a definitive, unambiguous SOW clause because of a missing answer, it goes in the Open Questions Log.

**Format:**

```markdown
| ID    | Question                                                    | Impact if Unanswered              | Owner  | Status |
|-------|-------------------------------------------------------------|-----------------------------------|--------|--------|
| Q-001 | What is the target SLA for the production environment?      | Cannot define support tier in SOW | Client | Open   |
| Q-002 | Is there an existing MSA in place?                          | Affects legal terms in SOW        | Client | Open   |
```

---

### Step 6 — Internal PRD Review Gate

Before proceeding to SOW generation, verify:

- [ ] Every requirement has a unique ID (FR-XXX / NFR-XXX)
- [ ] Every in-scope item has a corresponding deliverable candidate
- [ ] Every out-of-scope item is explicitly listed
- [ ] All assumptions are documented
- [ ] Open questions are logged (not silently assumed)
- [ ] No contradiction between sections
- [ ] Success criteria are measurable

> **If any item is unchecked, do not proceed to SOW generation. Return to Step 4 or raise questions.**

---

## Stage 3: SOW Generation

### Step 7 — PRD to SOW Mapping

Before writing, create an explicit mapping table:

| PRD Reference | SOW Section | Notes |
|---|---|---|
| FR-001 to FR-008 | Section 2.1 Workstream 1 | |
| NFR-002 (Security) | Section 2.1 Workstream 2 + Section 14 | |
| A-001 to A-005 | Section 5 Assumptions | |
| D-001 to D-003 | Section 6 Dependencies | |
| Open Qs blocking SOW | Must resolve before SOW finalised | |

**Every PRD requirement must either:**
- Map to a deliverable in Section 3, OR
- Map to an explicit exclusion in Section 2.2, OR
- Remain blocked by an open question (flagged)

---

### Step 8 — Draft the SOW

Use `sow-template.md`. Writing rules:

**Language Standards:**
- Use active voice: "Provider will deliver..." not "Delivery will be..."
- Avoid "best efforts", "reasonable endeavours" in scope statements — be specific
- Use "shall" for obligations, "will" for factual statements
- Quantify everything: not "within a reasonable time" → "within 5 business days"
- Avoid "etc.", "and so on", "including but not limited to" in scope — it creates ambiguity

**Scope Writing Pattern:**
```
✅ GOOD: "Provider will deploy a managed Kubernetes cluster on AWS EKS in the eu-west-1 region, 
         configured with auto-scaling, integrated with AWS ALB, and connected to the Client's 
         existing VPC via Transit Gateway."

❌ BAD:  "Provider will set up Kubernetes and configure networking as needed."
```

**Deliverable Definition Pattern:**
```
Deliverable: Architecture Design Document
Description: A detailed HLD and LLD covering compute, networking, security, 
             and identity components of the proposed solution.
Acceptance Criteria: Document reviewed and approved in writing by Client CTO 
                     or nominated delegate within 5 business days of submission.
Format: PDF and editable source (.drawio / .pptx)
```

**Flagging for Legal Review:**
- Mark any clause containing: liability, IP, termination, warranties, payment penalties, data processing
- Use `[LEGAL REVIEW]` inline and summarise at the end of the SOW in a review checklist

---

### Step 9 — SOW Quality Gate

Run the following checks before marking SOW as ready for review:

**Scope Completeness**
- [ ] Every PRD in-scope item maps to a SOW deliverable or workstream
- [ ] Every PRD out-of-scope item is listed in SOW Section 2.2
- [ ] No requirement is ambiguous or undefined

**Commercial Completeness**
- [ ] All fees are specified (no TBD in final SOW)
- [ ] Payment triggers are tied to specific milestones or dates
- [ ] Expense policy is defined

**Legal & Risk**
- [ ] All `[LEGAL REVIEW]` sections are flagged
- [ ] Client obligations are fully specified
- [ ] Change control process is defined
- [ ] Assumptions clearly state the re-scoping right

**Client Readiness**
- [ ] No internal notes or commentary visible in the document
- [ ] Tone is professional and client-appropriate
- [ ] Document is complete (no placeholder text remaining)

---

## Outputs Checklist

On completion of each engagement, the following must be delivered:

| Output | File | Status |
|---|---|---|
| PRD | `prd-[client]-[date].md` | |
| SOW | `sow-[client]-[date].docx` | |
| Open Questions Log | `open-questions-[client].md` | |
| Risk Register | `risk-register-[client].md` | |
| PRD→SOW Mapping Table | Embedded in SOW notes | |

---

## Escalation Triggers

Escalate to a senior commercial or legal reviewer if:

- Total engagement value exceeds [threshold]
- Engagement involves regulated data (PII, PHI, financial records)
- Client is in a regulated industry with specific compliance requirements
- MSA has not been reviewed for this client
- Scope includes multi-jurisdiction delivery
- IP terms deviate from standard Provider position
- Client requests unlimited liability or uncapped SLAs