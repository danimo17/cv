# 032 · The CV PDFs live only in the project

**Decision.** The CV PDFs (`public/cv/cv-{en,ca,es}.pdf`) are MOVED from Downloads into the project (not copied): no copy remains outside the repo. Before moving them, the text layer is verified (rule 04). Any new version follows the same path: export → verify → move → commit.
**Consequences.** The (public) repo is the sole source of the PDFs; that's why they cannot contain a phone number or postal address.
