# Quality Gates & Validation Checklists

> Run these checklists at each stage gate. A gate only passes when all items are checked. Flag any unchecked item as a blocker.

---

## Gate 1 — Input Quality Check
*Run before beginning PRD generation*

### Transcript Quality
- [ ] Transcript is readable and complete (no significant garbling)
- [ ] Speakers are identifiable (by name or role)
- [ ] Date of call is known
- [ ] Client company and project context is clear

### Supporting Documents
- [ ] Document types have been classified
- [ ] Document dates noted (identify if outdated)
- [ ] Conflicts between documents flagged
- [ ] Any referenced documents not provided have been noted as gaps

**Gate 1 Result:** `PASS` / `BLOCKED — [reason]`

---

## Gate 2 — PRD Completeness
*Run before beginning SOW generation*

### Section Completeness
- [ ] Executive Summary written (2–4 sentences)
- [ ] Client Context fully described
- [ ] All Functional Requirements documented with IDs
- [ ] All Non-Functional Requirements documented with IDs
- [ ] In-Scope items listed explicitly
- [ ] Out-of-Scope items listed explicitly
- [ ] Assumptions documented (minimum 5)
- [ ] Dependencies documented
- [ ] Open Questions logged
- [ ] Risks documented with likelihood and impact
- [ ] Success Criteria defined and measurable
- [ ] Client Obligations identified

### Requirement Quality
- [ ] Every requirement is specific and testable
- [ ] No requirement uses vague language ("fast", "scalable", "modern")
- [ ] MoSCoW priority assigned to every requirement
- [ ] No conflicting requirements present
- [ ] Every Must Have requirement has a clear source (transcript / RFP)

### Scope Quality
- [ ] No ambiguous items left in scope (could mean different things to client vs. delivery team)
- [ ] Every "and also..." or "nice to have" from transcript is either in scope or out of scope
- [ ] Deferred items noted in Future Phase section

**Gate 2 Result:** `PASS` / `BLOCKED — [reason]`

---

## Gate 3 — SOW Draft Review
*Run before SOW goes to commercial / legal review*

### Scope & Deliverables
- [ ] Every PRD in-scope item maps to a SOW workstream or deliverable
- [ ] Every PRD out-of-scope item is listed in SOW Section 2.2
- [ ] Every deliverable has specific, measurable acceptance criteria
- [ ] Acceptance timelines defined (days from submission)
- [ ] No "to be determined" or "TBD" in scope sections

### Assumptions & Dependencies
- [ ] All PRD assumptions carried into SOW Section 5
- [ ] Change request right is explicitly stated for each assumption
- [ ] All dependencies have named owners (Client / Provider / Third Party)

### Commercial
- [ ] Engagement model selected (Fixed / T&M / Retainer)
- [ ] All fee line items specified (no blank amounts)
- [ ] Payment schedule tied to specific milestones or dates
- [ ] Expense policy defined
- [ ] Invoice terms stated

### Client Obligations
- [ ] Access requirements specified with timelines
- [ ] Named sponsor / point of contact required
- [ ] SME availability expectations defined
- [ ] Document provision timelines stated
- [ ] Decision turnaround times stated
- [ ] Consequence of unmet obligations stated (delay, change request)

### Language Quality
- [ ] No use of "best efforts", "reasonable endeavours" in scope statements
- [ ] No vague quantifiers ("quickly", "soon", "timely")
- [ ] All timeframes expressed as business days (not calendar days, unless specified)
- [ ] Active voice used throughout
- [ ] No internal commentary visible
- [ ] No placeholder text remaining

### Legal Flags
- [ ] All `[LEGAL REVIEW]` sections identified and summarised for reviewer
- [ ] IP clause present
- [ ] Confidentiality clause present
- [ ] Change control process defined
- [ ] Termination clause present
- [ ] Limitation of liability referenced

**Gate 3 Result:** `PASS` / `BLOCKED — [reason]`

---

## Gate 4 — Pre-Send Final Check
*Run after legal/commercial review, before sending to client*

- [ ] All `[LEGAL REVIEW]` flags resolved
- [ ] Document version updated to v1.0 (or agreed version)
- [ ] Document date updated
- [ ] Client name spelled correctly throughout
- [ ] No internal file paths, comments, or notes visible
- [ ] Signature blocks contain correct party names
- [ ] SOW reference number assigned
- [ ] Document converted to PDF for sending (unless client requests Word)

**Gate 4 Result:** `PASS — READY TO SEND` / `BLOCKED — [reason]`

---

## Common Failure Modes (Learn from these)

| Failure Mode | Where It Causes Problems | Prevention |
|---|---|---|
| Vague scope statement | Client disputes what was included | Use the scope writing pattern in `workflow.md` |
| Missing client obligations | Delivery delays blamed on Provider | Always define client obligations explicitly |
| No change control clause | Scope creep is free | Always include Section 9.3 |
| Assumed compliance requirement | Security controls not scoped | Ask explicitly about compliance in every engagement |
| Unrealistic timeline not challenged | Project failure | Flag in risk register; add caveat to assumptions |
| Single-point-of-contact assumption | Key person leaves client mid-project | Require backup contact in Client Obligations |
| Third-party dependency not scoped | Integration delays derail delivery | Always identify and document third-party touchpoints |
| "Everything" migrations | Scope is undefined | Require asset inventory as Phase 1 deliverable |
| Budget not confirmed | Commercial dispute | Confirm budget range before SOW finalisation |