# 02 · No company code or internal resources

**What.** Nothing copied from repositories, documents, designs or internal tools of any company the user has
worked at (PDPAOLA included). The work done can be **described** using what is public (LinkedIn, public
website, CV).
**Why.** Intellectual property and confidentiality. This repo is public.
**How it's checked.** `tests/arch/no-internal-resources.spec.ts` fails on markers of a company's internal systems
in any tracked file (Atlassian cloud hosts, Jira ticket and Confluence URLs, Slack message URLs, private-org GitHub
URLs, company sub-domains and e-mail addresses, internal hostnames). That is the checkable slice; whether code or a
design was copied from a private source stays human review: every contract declares its sources and the review
checklist asks about it.
