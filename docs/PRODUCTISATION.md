# InteractiveStudio: path to an online product

Decision note · 2 November 2026

**Yes. InteractiveStudio can become a hosted creation studio.** The reusable project format, React animation components and deterministic renderer are suitable foundations. The first milestone remains a local technical proof; online product readiness requires additional engineering and a validated customer need.

The recommended initial customer is an adult creator, caregiver or educator producing private songs, narrated stories and visual routines. Begin with one clear use case and test whether another adult can create a useful second episode without engineering help. This is a product hypothesis to validate, rather than evidence of market demand.

## Preserve these boundaries now

| Boundary | Initial implementation | Future hosted implementation |
| --- | --- | --- |
| Project document | Versioned JSON, validated by a shared schema | Same document behind authenticated, workspace-scoped APIs |
| Project storage | Local repository and project-relative asset keys | Database metadata plus private object storage; signed asset access |
| Animation | React/SVG components using explicit time and authored state | Reuse the components in browser previews and isolated render workers |
| Rendering | One CPU render at a time on this Windows machine | Durable queue, isolated CPU workers, quotas and cancellation |
| Review | Explicit rights confirmation and human content approval | Recorded approver, reviewed revision, audit trail and separate sharing permissions |
| Integrations | Manual import of audio, artwork and storyboard data | Optional provider integrations only after confirming their commercial/API terms |

Project documents refer to audio through relative content-hashed keys. They do not store computer-specific absolute paths or executable animation code. Keeping rendering separate from HTTP request handling makes it possible to change storage and execution infrastructure without replacing the creative model.

The local service is a single-user development service. Binding it to the internet does not turn it into a secure hosted product. There are no implemented user accounts, tenant isolation, billing or cloud deployment in this milestone.

## A practical release sequence

1. **Private local proof:** import an approved 20–30 second clip; align mouth cues; render a clean MP4; reopen the project and repeat the export. Measure render duration, memory and correction time.
2. **Creator pilot:** finish one full episode and one different story/routine using the same rigs. Make the common edits possible without code. Test with a small number of invited adults.
3. **Hosted private beta:** add authenticated adult accounts, workspace authorization, private uploads, background render jobs, quotas, deletion and backups. Keep learner details and personalised outputs private by default. Establish support and incident procedures.
4. **Paid service:** introduce usage metering and payment only after measuring cost and demand. A subscription with a defined number of export credits is a possible model; unlimited rendering is premature without benchmarks.

For the hosted beta, use a conventional web application/API with durable storage and a separate render worker pool. Choose providers when the actual workload is measured. Avoid coupling the project schema to a hosting vendor during the local proof.

## Cost and operating questions to answer

Record CPU minutes, peak memory, asset bytes, export bytes, failed attempts and successful exports for each render preset. A useful starting model is:

```text
cost per successful export =
  render compute + failed-attempt compute + storage + transfer
  + applicable software licensing + support allocation
```

Queue limits, upload limits and account budgets should exist before opening a self-service renderer. Keep browsers and media tools patched, isolate jobs, and accept structured scene data with known assets rather than customer-supplied executable code. These are proposed requirements for the hosted phase, not features already implemented.

## Commercial dependencies checked

Remotion's published Free License covers individuals and eligible organisations of up to three people. Its FAQ explicitly permits eligible users to launch a SaaS and build automations. A template-based personalised-video service is an accepted use case; a general service accepting customers' own Remotion projects has different restrictions. See the [official license FAQ](https://www.remotion.dev/docs/license/faq) and [source license](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).

For entities requiring a Company License, the published automation option is currently $0.01 per render with a $100 monthly minimum; infrastructure is additional. Recheck eligibility, headcount definitions and pricing before a commercial launch. See [Remotion pricing](https://www.remotion.dev/docs/license/pricing). At this review, the [v5 terms page](https://www.remotion.dev/docs/terms) is marked as upcoming and points to the [v4 terms](https://www.remotion.pro/terms-4-0); use the license and terms applicable to the version actually installed.

Suno's paid-subscription help page describes commercial-use rights for qualifying downloaded songs and distinguishes those rights from copyright protection. Preserve evidence for each specific song and check any additional restrictions before commercial use. The creator's personal subscription is not evidence that InteractiveStudio may resell Suno access or automate its interface. See [Suno's paid-subscription rights](https://help.suno.com/en/articles/9601665).

Before a hosted beta, review the applicable terms of every shipped component, including FFmpeg builds, codecs, Rhubarb and any purchased assets. Keep a dependency and asset license inventory. No component has been purchased or commercial contract accepted as part of this setup.

## Product and data decisions still open

- Validate who pays: individual caregivers, independent creators or education organisations.
- Decide whether hosting starts with fictional content only, and how optional learner details will be handled and deleted.
- Define the reviewed project revision, approver and permitted export audience as separate records.
- Confirm retention periods, backup deletion, support access and any obligations triggered by the intended users and jurisdictions before collecting customer data.
- Check InteractiveStudio's trademark and domain availability before investing in public branding. The working name has been selected; availability has not been established.

The first hosted offer should make one repeatable creative task easy. Additional templates, collaborative editing and provider integrations can follow evidence from that workflow.
