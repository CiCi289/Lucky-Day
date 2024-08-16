
using LuckyDrawApp;
using LuckyDrawApp.Models;
using LuckyDrawApp.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;

System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });



//Tavanem
//builder.Services.AddIndexedDbService();

//Dbnet
//builder.Services.AddIndexedDbDatabase<LuckyDrawDb>(options =>
//{
//  options.UseDatabase(DatabaseModel.GetDatabaseModel());
//});

//builder.Services.AddIndexedDbDatabase<LuckyDrawDb>(options =>
//{
//  options.UseDatabase(IndexedDbConfigService.GetDatabaseModel());
//});

builder.Services.AddScoped<IndexedDBService>();

await builder.Build().RunAsync();

//static IndexedDbDatabaseModel GetDatabaseModel()
//{
//  var model = new IndexedDbDatabaseModel()
//      .WithName("LuckyDrawDb")
//      .WithVersion(1);

//  model.AddStore<RaffleEntry>()
//      .WithAutoIncrementingKey("Id")
//      .AddUniqueIndex("Id")
//      .AddIndex("Code")
//      .AddIndex("Name")
//      .AddIndex("PhoneNumber");

//  model.AddStore<Prize>()
//      .WithAutoIncrementingKey("Id")
//      .AddUniqueIndex("Id")
//      .AddIndex("Name")
//      .AddIndex("Winners");

//  return model;
//}
