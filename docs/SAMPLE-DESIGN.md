# Exact-model reference lookup

This document describes the illustrative sample only, not Bizkonic's production architecture or technology stack.

## Contract

`createLookup(records)` validates the supplied array and builds a private snapshot index. It returns a function accepting `{ model, code, language }`. Model and code must be nonempty ASCII letter/digit groups separated by hyphens, at most 64 characters. Surrounding whitespace and letter case are normalized. Internal spaces, omitted hyphens and Unicode lookalikes are not silently repaired.

Language is `en`, `fr` or `fa`, defaulting to `en`. Every record requires an English fallback, a unique record ID, a source label and nonempty translated title/explanation strings. The factory validates structure, not factual truth or authority of a source.

| Outcome | Meaning |
| --- | --- |
| `found` | Exactly one model/code match. Includes a source label, selected translation and explicit fallback flag. |
| `not_found` | No exact match. No reference is invented or borrowed from another model. |
| `ambiguous` | More than one record matches. Returns candidate IDs and source labels instead of silently choosing a repair explanation. |
| `TypeError` | Input or dataset is malformed. The caller decides how to display validation errors. |

## Design decisions

- A composite model/code key prevents the same code on another model from supplying an unrelated explanation.
- Missing translations fall back visibly to English. Unsupported requested languages are rejected.
- Only normalized, validated scalar fields are copied into the index. Editing the original dataset or a returned result does not change future lookups.
- An ambiguous result preserves uncertainty. Real reference applicability may also depend on revision, firmware, region and installed units; those are intentionally outside this small example.
- There is no fuzzy matching, network request, device access, authentication or permission system. This sample cannot stand in for the application's server-side access controls.

The dataset is intentionally tiny and fictional. It contains no real manufacturer codes or repair instructions. The sample uses JavaScript and Node's built-in test runner; that is a choice for the sample, not a claim about the production app's stack.

## Checks

Run `node test/lookup.test.mjs` for model separation, multilingual selection, missing translations, malformed inputs, duplicate IDs, ambiguous references and mutation isolation. Run `node sample/demo.mjs` to inspect representative results. The package scripts provide equivalent npm shortcuts.

This repository has no automated deployment or GitHub Actions workflow. Running the sample does not call a service or consume an AI API.
