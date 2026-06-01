package br.edu.utfpr.pb.pw44s.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long pendingOrders;
    private long paidOrders;
    private long shippedOrders;
    private long deliveredOrders;
    private long canceledOrders;
    private long lowStockProducts;
}
