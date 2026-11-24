# How-To Guides

## Sample Task: Add a New Regional Variant (e.g. Tonglu)

**Scenario**: create structured rules for Tonglu mahjong as a new derivative.

**Steps**:

1. Read the Hangzhou base rules and list every point where Tonglu differs.
2. Create a root doc named `【桐庐麻将】好友房规则-结构化.md`.
3. Organize content with the nine-category taxonomy used by the Xiaoshan doc.
4. Write differences only; mark identical parts as "same as Hangzhou".
5. Commit and add the variant to the README overview list.

**Expected result**: a new differential doc from which a complete variant can be derived.

## Sample Task: Modify Base Rules

**Scenario**: the Hangzhou base rules themselves need revision.

**Steps**:

1. Edit the affected entries in the Hangzhou doc.
2. Search all variant docs referencing those entries and verify the differences still hold.
3. Note the impact scope in the commit message.

**Expected result**: base rules updated with all derivative docs kept consistent.

## Sample Task: Query Rules with an AI Agent

**Steps**: provide the repo as context — base rules doc first, then the target variant's differential doc — and ask the agent to compose answers.

**Expected result**: complete, conflict-free rules for the target variant.
