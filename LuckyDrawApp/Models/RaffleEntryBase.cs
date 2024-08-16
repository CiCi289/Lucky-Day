namespace LuckyDrawApp.Models
{
  public class RaffleEntryBase
  {
    public string Code { get; set; }
    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsUsed { get; set; } = false;
  }
}
