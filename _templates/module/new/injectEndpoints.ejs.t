---
to: src/constants/apiEndpoints.ts
inject: true
after: hygen:endpoints
skip_if: "<%= pluralCamel %>: '/<%= folder %>'"
---
  <%= pluralCamel %>: '/<%= folder %>',
  <%= singularCamel %>: (id: string) => `/<%= folder %>/${id}`,
  <%= pluralCamel %>ActiveList: '/<%= folder %>/active/list',
  <%= pluralCamel %>ExportExcel: '/<%= folder %>/export/excel',
  <%= pluralCamel %>ApprovalApprove: (requestId: number | string) => `/<%= folder %>/approvals/${requestId}/approve`,
  <%= pluralCamel %>ApprovalReject: (requestId: number | string) => `/<%= folder %>/approvals/${requestId}/reject`,
