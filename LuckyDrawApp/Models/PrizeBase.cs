namespace LuckyDrawApp.Models
{
  public class PrizeBase
  {
    public string Name { get; set; }
    public byte[] ImageData { get; set; }
    public List<RaffleEntry>? Winners { get; set; } = new List<RaffleEntry>();
  }

}

  //Add with Base, Get with Id, Update with Id