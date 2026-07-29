# FINCAVA Platform Feature Enhancement #2

# Farm & Lot Verification Service

## Overview

Enhance the existing **Farm (Single Source) and Lot Verification** page
to present it as a professional, premium service rather than a basic
inquiry form. The enhancement focuses on improving the customer
experience, clarifying the service offering, and streamlining the
internal review process without introducing unnecessary operational
complexity.

This feature is an enhancement of the existing functionality---not a new
product or workflow.

## Objectives

-   Present FINCAVA as a trusted, independent verification partner.
-   Clearly explain the verification process.
-   Set customer expectations regarding service availability.
-   Treat every submission as a **Request for Quotation (RFQ)**.
-   Improve the quality of information collected before preparing a
    quote.
-   Reduce manual research effort through an internal AI-assisted
    pre-assessment.

## Customer-Facing Enhancements

### Service Overview

Explain that FINCAVA provides independent farm and coffee lot
verification services for buyers, importers, exporters, lenders,
insurers, and other stakeholders.

### What We Verify

-   Farm existence
-   Producer identity
-   GPS location
-   Farm characteristics
-   Coffee varieties
-   Processing facilities
-   Coffee lot verification
-   Storage conditions
-   Photos and video documentation
-   Certifications (when available)
-   Supporting documentation

### How the Process Works

1.  Submit a verification request.
2.  FINCAVA reviews the request.
3.  Operational feasibility is evaluated.
4.  A custom quotation is prepared.
5.  Customer accepts the quotation.
6.  Phone screening is conducted.
7.  Field visit is scheduled.
8.  Verification report is delivered.

### Service Availability

Every request is individually reviewed before acceptance.

Certain farms or coffee-producing regions may not be serviceable due
to: - Geographic accessibility - Road conditions - Distance from
operational areas - Weather - Security considerations - Local
transportation availability - Seasonal conditions

Submission of a request does not guarantee acceptance.

### Pricing

Verification services are provided on a **custom quotation** basis.

Pricing depends on: - Location - Accessibility - Travel distance -
Required travel time - Estimated field time - Transportation
requirements - Security considerations - Overall project complexity

### Request Form

Keep the existing form and add these optional fields: - GPS
Coordinates - Requested Completion Deadline - Purpose of Verification -
Attachments - Additional Notes

### Disclaimer

FINCAVA performs independent field observations based on conditions at
the time of the visit.

Verification requests are reviewed individually before acceptance.

Operational, geographic, weather, transportation, or security conditions
may prevent FINCAVA from accepting certain assignments.

## Internal Enhancement (AI Assisted)

After a request is submitted, Claude performs an internal research task
to create a **Mission Brief** that supports quotation preparation. The
report is for internal use only.

### Research Areas

Where information is publicly available: - Location summary -
Coffee-producing region - Accessibility - Travel considerations - Public
security observations - Nearby transportation - Seasonal/weather
considerations - Potential logistical challenges - Overall operational
complexity (Low/Medium/High)

If reliable information is unavailable, Claude should explicitly state
that.

### Claude Prompt

``` text
You are assisting the FINCAVA operations team with a preliminary assessment of a coffee farm verification request in Colombia.

Using only publicly available information, prepare a concise Mission Brief.

Include information only when it can be reasonably verified. If information is unavailable, state "Information not readily available."

Provide:
1. Location Summary
2. Coffee-producing region information
3. Accessibility assessment
4. Estimated travel considerations
5. Public security observations
6. Nearby transportation options
7. Seasonal or weather considerations
8. Potential logistical challenges
9. Overall operational complexity (Low, Medium, High)

Do not estimate pricing.
Do not recommend accepting or rejecting the assignment.
Do not speculate or invent information.
This report is for internal FINCAVA use only.
```

## Functional Requirements

-   Existing verification workflow remains unchanged.
-   Every submission is treated as an RFQ.
-   Optional fields improve request quality.
-   Administrators review requests before preparing quotes.
-   Claude Mission Brief is available internally before quotation.
-   AI findings are never shown to customers.

## Out of Scope (MVP)

-   Mobile inspection app
-   Customer portal
-   Automated scheduling
-   GPS tracking
-   Route optimization
-   AI-generated customer reports
-   Digital signatures
-   QR verification
-   Automated pricing

## Acceptance Criteria

1.  The page presents a professional service offering.
2.  Customers understand the review and quotation process.
3.  Additional optional fields are available.
4.  Every request is handled as an RFQ.
5.  Service limitations are clearly communicated.
6.  Claude generates an internal Mission Brief.
7.  AI supports, but does not replace, human decision-making.
8.  The enhancement fits the existing workflow without adding
    unnecessary complexity.
