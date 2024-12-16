<div align="center">
  <img src="public/icon.svg" height="64" width="64">

  # CSV Deduper

  A Next.js application for processing CSV files with comma-separated values in cells through row expansion and metric aggregation.
</div>

![image](https://github.com/user-attachments/assets/af55dc29-db72-4f33-885e-660672bab481)


## What is Row Expansion?

Row expansion transforms data where multiple values are stored in a single cell (comma-separated) into separate rows. This is particularly valuable when working with analytics data where events or content might belong to multiple categories.

Here's a simple example:

### Before expansion

| Content group | Page views | Time on page |
| ------------- | ---------- | ------------ |
| Sports,Tech   | 1500       | 120          |
| News          | 750        | 90           |

### After expansion and aggregation

| Content group | Page views_sum | Time on page_average |
| ------------- | -------------- | -------------------- |
| Sports        | 1500           | 120                  |
| Tech          | 1500           | 120                  |
| News          | 750            | 90                   |

## Features

- Row expansion for comma-separated values
- Configurable metric aggregations (sum, average, max, min, count)
- Interactive data preview
- Processed file download
- Clean, intuitive interface

https://github.com/user-attachments/assets/d6580c45-5038-4b7f-af0c-1404952ffc88
