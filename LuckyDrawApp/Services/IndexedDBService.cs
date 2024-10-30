using LuckyDrawApp.Models;
using Microsoft.JSInterop;
using System.Security.Cryptography.X509Certificates;
using System.Xml.Linq;

namespace LuckyDrawApp.Services
{
  public class IndexedDBService
  {
    private readonly IJSRuntime _jsRuntime;

    public IndexedDBService(IJSRuntime jsRuntime)
    {
      _jsRuntime = jsRuntime;
    }



    //public async Task<object> OpenDb(string dbName)
    //{
    //  return await _jsRuntime.InvokeAsync<object>("indexedDBInterop.openDb", dbName);
    //}
    //public async Task EnsureDatabaseOpen()
    //{
    //  await _jsRuntime.InvokeVoidAsync("indexedDBInterop.ensureDbOpen");
    //}
    public async Task CreateEntryDbAsync(string dbName)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.createEntryDb", dbName);
    }

    public async Task CreatePrizeDbAsync(string dbName)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.createPrizeDb", dbName);
    }

    public async Task CreateGalleryDbAsync(string dbName)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.createGalleryDb", dbName);
    }

    public async Task AddImageToGalleryAsync(string dbName, byte[] imageData)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.addImageToGallery", dbName, "Gallery", imageData);
    }

    public async Task<List<byte[]>> GetAllImagesFromGalleryAsync(string dbName)
    {
      return await _jsRuntime.InvokeAsync<List<byte[]>>("indexedDBInterop.getAllImagesFromGallery", dbName, "Gallery");
    }

    public async Task AddItemAsync<T>(string dbName, string storeName, T item)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.addItem", dbName, storeName, item);
    }

    public async Task AddItemsInBatchAsync<T>(string dbName, string storeName, T batch)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.addItemsInBatch", dbName, storeName, batch);
    }

    //public async Task<int> AddItem(string storeName, object item)
    //{
    //  return await _jsRuntime.InvokeAsync<int>("indexedDBInterop.addItem", storeName, item);
    //}

    //public async Task<T> GetItem<T>(string storeName, int key)
    //{
    //  return await _jsRuntime.InvokeAsync<T>("indexedDBInterop.getItem", storeName, key);
    //}

    public async Task<T> GetItemAsync<T>(string dbName, string storeName, int id)
    {
      return await _jsRuntime.InvokeAsync<T>("indexedDBInterop.getItem", dbName, storeName, id);
    }

    public async Task<T> GetAllItemsAsync<T>(string dbName, string storeName)
    {
      return await _jsRuntime.InvokeAsync<T>("indexedDBInterop.getAllItems", dbName, storeName);
    }

    //public async Task<T?> GetAllItems<T>(string storeName)
    //{
    //  return await _jsRuntime.InvokeAsync<T?>("indexedDBInterop.getAllItems", storeName);
    //}

    public async Task<T> GetRandomItemAsync<T>(string entryDbName, string entryStoreName, string prizeDbName, string prizeStoreName)
    {
        return await _jsRuntime.InvokeAsync<T>("indexedDBInterop.getRandomItem", entryDbName, entryStoreName, prizeDbName, prizeStoreName);
      
      
    }

      public async Task UpdateItemAsync<T>(string dbName, string storeName, T item)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.updateItem", dbName, storeName, item);
    }

    //public async Task UpdateAllItems<T>(string storeName, List<T> items)
    //{
    //  await _jsRuntime.InvokeVoidAsync("indexedDBInterop.updateAllItems", storeName, items);
    //}

    public async Task UpdateAllItemsAsync<T>(string dbName, string storeName, T[] items)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.updateAllItems", dbName, storeName, items);
    }

    public async Task DeleteItemAsync(string dbName, string storeName, int key)
    {
      await _jsRuntime.InvokeVoidAsync("indexedDBInterop.deleteItem", dbName, storeName, key);
    }

    public async Task<T> GetItemByInternalKeyAsync<T>(string dbName, string storeName, int internalKey)
    {
      return await _jsRuntime.InvokeAsync<T>("indexedDBInterop.getItemByInternalKey", dbName, storeName, internalKey);
    }

    public async Task<List<KeyValuePair<int, T>>> GetAllItemsWithInternalKeysAsync<T>(string dbName, string storeName)
    {
      return await _jsRuntime.InvokeAsync<List<KeyValuePair<int, T>>>("indexedDBInterop.getAllItemsWithInternalKeys", dbName, storeName);
    }

    public async Task<string> ClearStoreAsync(string dbName, string storeName)
    {
      return await _jsRuntime.InvokeAsync<string>("indexedDBInterop.clearStore", dbName, storeName);
    }

    public async Task<string> DeleteDatabaseAsync(string dbName)
    {
      return await _jsRuntime.InvokeAsync<string>("indexedDBInterop.deleteDatabase", dbName);
    }



  }
}
