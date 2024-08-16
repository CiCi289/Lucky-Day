namespace LuckyDrawApp.Models
{
  public class PrizeBase
  {
    public string Name { get; set; }
    public List<RaffleEntryBase>? Winners { get; set; } = new List<RaffleEntryBase>();
  }

}

  //Add with Base, Get with Id, Update with Id