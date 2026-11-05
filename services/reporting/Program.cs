using System.Security.Cryptography;
using System.Text;
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
var serviceToken = Environment.GetEnvironmentVariable("REPORTING_SERVICE_TOKEN");
if (string.IsNullOrWhiteSpace(serviceToken) || serviceToken.Length < 24)
    throw new InvalidOperationException("REPORTING_SERVICE_TOKEN must be at least 24 characters");
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "fieldops-reporting" }));
app.MapPost("/api/reports/overview", (HttpRequest request, ReportRequest payload) =>
{
    var provided = request.Headers["x-service-token"].ToString();
    if (!CryptographicOperations.FixedTimeEquals(
        SHA256.HashData(Encoding.UTF8.GetBytes(provided)),
        SHA256.HashData(Encoding.UTF8.GetBytes(serviceToken))))
        return Results.Unauthorized();
    var orders = payload.Orders ?? [];
    var now = DateTimeOffset.UtcNow;
    var counts = orders.GroupBy(x => x.Status).ToDictionary(x => x.Key, x => x.Count());
    var completed = orders.Where(x => x.CompletedAt.HasValue).ToList();
    double avgHours = completed.Count == 0 ? 0 :
        completed.Average(x => (x.CompletedAt!.Value - x.CreatedAt).TotalHours);
    var overdue = orders.Count(x =>
        x.Status != "COMPLETED" && x.Status != "CANCELLED" &&
        (now - x.CreatedAt).TotalHours > (x.Priority switch
        {
            "CRITICAL" => 4,
            "HIGH" => 8,
            "MEDIUM" => 24,
            _ => 72
        }));
    return Results.Ok(new
    {
        total = orders.Count,
        byStatus = counts,
        overdue,
        averageCompletionHours = Math.Round(avgHours, 2),
        generatedAt = now
    });
});
app.Run();
public record ReportRequest(List<WorkOrderInfo>? Orders);
public record WorkOrderInfo(string Id, string Status, string Priority,
    DateTimeOffset CreatedAt, DateTimeOffset? CompletedAt);
