# Venue Directory

The venue directory is the first product capability that turns the quiz entry point toward real tennis meetups.

## Product Purpose

- Help players discover nearby tennis courts before creating or joining a session.
- Provide area and court-count filters for future meetup flows.
- Keep venue metadata separate from private booking contacts until the owner approves the source and sharing boundary.

## Seed Source

- Source image: `西安球场统计（2026.6.4更新）`
- Observed columns: venue name, area, address, outdoor courts, indoor courts, covered courts, total courts, contact method, notes.
- Observed size: 69 rows.

The image includes phone numbers and operational notes. Treat it as a private source artifact unless the owner explicitly approves a cleaned dataset.

## Database Mapping

| Source column | Database field | Notes |
| --- | --- | --- |
| 球场信息 | `name` | Required |
| 所属片区 | `area` | Required; used for filters |
| 地址 | `address` | Required |
| 室外 | `outdoor_courts` | Non-negative integer |
| 室内 | `indoor_courts` | Non-negative integer |
| 风雨棚 | `covered_courts` | Non-negative integer |
| 总数 | `total_courts` | Must equal outdoor + indoor + covered |
| 备注 | `booking_note` | Public operational note only |
| 联系方式 | not committed as seed data | Add only after manual approval |

## API

- `GET /api/venues`
  - Optional query: `area`, `q`, `limit`
  - Searches name and address.
  - Defaults to 50 records and caps at 100.
- `GET /api/venues/areas`
  - Returns area names with venue counts.

## Import Rules

- Do not commit raw phone numbers, WeChat IDs, or private booking contacts from screenshots.
- Prefer a cleaned CSV or SQL seed reviewed by the owner before importing production data.
- If contacts are needed later, separate public booking channels from personal phone numbers.
- Keep source date in `source_updated_on` so stale venue data can be reviewed.

## Next Steps

- Convert the source image into a reviewed CSV outside the repo.
- Import only cleaned metadata first: name, area, address, court counts, source label, source date.
- Add frontend venue browsing after the API has real reviewed data.
- Connect venue selection to future session creation and match invitations.
