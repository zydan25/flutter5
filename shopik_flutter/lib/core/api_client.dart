import 'dart:convert';
import 'dart:math';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

class ApiException implements Exception {
  final int statusCode;
  final String message;
  final dynamic data;
  ApiException(this.statusCode, this.message, [this.data]);
  @override String toString() => message;
}

class ApiClient {
  ApiClient({String? baseUrl}) : baseUrl = (baseUrl ?? 'https://shopik.alattab.site/api').replaceAll(RegExp(r'/$'), '');
  final String baseUrl;
  final _storage = const FlutterSecureStorage();
  final http.Client _client = http.Client();
  static const _timeout = Duration(seconds: 15);
  bool _legacyTransferConfirmationPending = false;

  Future<String?> token() => _storage.read(key: 'shopik_access_token');
  Future<void> saveToken(String value) => _storage.write(key: 'shopik_access_token', value: value);
  Future<void> clearToken() => _storage.delete(key: 'shopik_access_token');
  Future<Map<String,String>> _headers({bool json=false}) async { final t=await token(); final authToken=(t!=null&&t.isNotEmpty)?t:'3241591d9733768e4b5d3226c96b200e04c7ca15'; return {'Accept':'application/json',if(json)'Content-Type':'application/json','Authorization':'Token $authToken'}; }
  Uri _uri(String path,[Map<String,dynamic>? query]) { final clean=path.startsWith('/')?path:'/$path'; return Uri.parse('$baseUrl$clean').replace(queryParameters:query?.map((k,v)=>MapEntry(k,v.toString()))); }
  dynamic _decode(http.Response response){if(response.bodyBytes.isEmpty)return {};try{return jsonDecode(utf8.decode(response.bodyBytes));}catch(_){return {'raw':utf8.decode(response.bodyBytes)};}}
  void _check(http.Response response){if(response.statusCode<200||response.statusCode>=300){final data=_decode(response);final message=data is Map&&data['detail']!=null?data['detail'].toString():data is Map&&data['message']!=null?data['message'].toString():'فشل الطلب (${response.statusCode})';throw ApiException(response.statusCode,message,data);}}
  Future<dynamic> get(String path,{Map<String,dynamic>? query}) async {final r=await _client.get(_uri(path,query),headers:await _headers()).timeout(_timeout);_check(r);return _decode(r);}
  Future<dynamic> post(String path,dynamic body,{String? idempotencyKey}) async {final h=await _headers(json:true);if(idempotencyKey!=null&&idempotencyKey.isNotEmpty)h['Idempotency-Key']=idempotencyKey;final r=await _client.post(_uri(path),headers:h,body:jsonEncode(body)).timeout(_timeout);_check(r);return _decode(r);}
  Future<dynamic> patch(String path,dynamic body) async {final r=await _client.patch(_uri(path),headers:await _headers(json:true),body:jsonEncode(body)).timeout(_timeout);_check(r);return _decode(r);}
  Future<dynamic> delete(String path) async {final r=await _client.delete(_uri(path),headers:await _headers()).timeout(_timeout);_check(r);return _decode(r);}

  Future<Map<String,dynamic>> login(String identifier,String password) async {final data=await post('/auth/login/',{'identifier':identifier.trim(),'password':password});if(data is! Map||data['token']==null)throw ApiException(200,'الخادم لم يُرجع رمز دخول صحيحًا',data);await saveToken(data['token'].toString());return Map<String,dynamic>.from(data);}
  Future<Map<String,dynamic>> register({required String phone,required String password,String username='',String firstName='',String middleName='',String thirdName='',String lastName='',String governorate=''}) async {final data=await post('/auth/register/',{'phone':phone.trim(),'password':password,if(username.trim().isNotEmpty)'username':username.trim(),'first_name':firstName.trim(),'middle_name':middleName.trim(),'third_name':thirdName.trim(),'last_name':lastName.trim(),'governorate':governorate.trim()});if(data is! Map||data['token']==null)throw ApiException(200,'تم التسجيل لكن الخادم لم يُرجع رمز الدخول',data);await saveToken(data['token'].toString());return Map<String,dynamic>.from(data);}
  Future<void> logout()=>clearToken();
  Future<Map<String,dynamic>> me() async=>Map<String,dynamic>.from(await get('/auth/me/'));

  Future<Map<String,dynamic>> walletBalance({String currency='YER'}) async=>Map<String,dynamic>.from(await get('/v2/accounting/wallets/me/balance/',query:{'currency':currency}));
  Future<Map<String,dynamic>> walletStatement({String currency='YER'}) async=>Map<String,dynamic>.from(await get('/v2/accounting/wallets/me/statement/',query:{'currency':currency}));
  Future<List<Map<String,dynamic>>> wallets() async=>_results(await get('/wallets/'));

  Future<Map<String,dynamic>> v2Root() async=>Map<String,dynamic>.from(await get('/v2/'));
  Future<Map<String,dynamic>> v2Schema() async=>Map<String,dynamic>.from(await get('/v2/schema/'));
  Future<Map<String,dynamic>> serviceCatalog() async=>Map<String,dynamic>.from(await get('/v2/services/catalog/'));
  Future<Map<String,dynamic>> serviceDetail(int id) async=>Map<String,dynamic>.from(await get('/v2/services/services/$id/'));
  Future<Map<String,dynamic>> serviceRequest({required int serviceId,required Map<String,dynamic> payload,String? itemType,int? itemId,String? idempotencyKey}) async {final key=idempotencyKey??'${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1<<30)}';return Map<String,dynamic>.from(await post('/v2/services/requests/',{'service_id':serviceId,'payload':payload,if(itemType!=null)'item_type':itemType,if(itemId!=null)'item_id':itemId},idempotencyKey:key));}
  Future<Map<String,dynamic>> serviceTransaction(String id) async=>Map<String,dynamic>.from(await get('/v2/services/requests/$id/'));
  Future<Map<String,dynamic>> serviceProviderCheck(String id) async=>Map<String,dynamic>.from(await get('/v2/services/requests/$id/provider-check/'));
  Future<Map<String,dynamic>> submitAndPollServiceRequest({required int serviceId, required Map<String,dynamic> payload, String? itemType, int? itemId, int maxPolls = 8}) async {
    final initial = await serviceRequest(serviceId: serviceId, payload: payload, itemType: itemType, itemId: itemId);
    final String? uuid = initial['id']?.toString();
    if (uuid == null || uuid.isEmpty) return initial;
    Map<String, dynamic> latest = initial;
    for (int i = 0; i < maxPolls; i++) {
      if (latest['status'] == 'success' || latest['status'] == 'failed' || (latest['result'] is Map && (latest['result'] as Map).isNotEmpty)) {
        return latest;
      }
      await Future.delayed(const Duration(milliseconds: 1400));
      try {
        latest = await serviceTransaction(uuid);
      } catch (_) {}
    }
    return latest;
  }
  Future<Map<String,dynamic>> queryYemenMobileOffers(String phone) async => submitAndPollServiceRequest(serviceId: 7, payload: {'mobile': phone.trim()});
  Future<Map<String,dynamic>> queryYemenMobileBalance(String phone) async => submitAndPollServiceRequest(serviceId: 6, payload: {'mobile': phone.trim()});
  Future<Map<String,dynamic>> queryYemen4g(String phone) async => submitAndPollServiceRequest(serviceId: 22, payload: {'mobile': phone.trim()});
  Future<Map<String,dynamic>> queryYemenNet(String phone) async => submitAndPollServiceRequest(serviceId: 25, payload: {'mobile': phone.trim()});
  Future<List<Map<String,dynamic>>> serviceReports() async=>_results(await get('/v2/services/reports/'));

  Future<List<Map<String,dynamic>>> wifiNetworks() async {final data=await get('/v2/services/wifi/networks/');if(data is Map&&data['networks'] is List)return List<Map<String,dynamic>>.from((data['networks'] as List).map((e)=>Map<String,dynamic>.from(e)));return _results(data);}
  Future<Map<String,dynamic>> wifiPurchase({required int networkId,required int denominationId,required String phone,required double price,String? idempotencyKey}) async {final key=idempotencyKey??'wifi-${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1<<30)}';return Map<String,dynamic>.from(await post('/v2/services/wifi/purchase/',{'network_id':networkId,'denomination_id':denominationId,'phone':phone,'amount':price},idempotencyKey:key));}
  Future<List<Map<String,dynamic>>> wifiCards() async {final data=await get('/v2/services/wifi/my-cards/');if(data is Map&&data['cards'] is List)return List<Map<String,dynamic>>.from((data['cards'] as List).map((e)=>Map<String,dynamic>.from(e)));return _results(data);}

  Future<dynamic> home({int? cityId})=>get('/home/',query:cityId==null?null:{'city_id':cityId});
  Future<List<Map<String,dynamic>>> cities() async=>_results(await get('/cities/'));
  Future<List<Map<String,dynamic>>> categories() async=>_results(await get('/categories/'));
  Future<List<Map<String,dynamic>>> catalogTree() async=>_results(await get('/catalog/tree/'));
  Future<List<Map<String,dynamic>>> products({Map<String,dynamic>? query}) async=>_results(await get('/products/',query:query));
  Future<Map<String,dynamic>> productDetail(int id) async=>Map<String,dynamic>.from(await get('/products/$id/'));
  Future<List<Map<String,dynamic>>> vendors({String? q}) async=>_results(await get('/vendors/',query:q==null?null:{'q':q}));
  Future<Map<String,dynamic>> vendorDetail(int id) async=>Map<String,dynamic>.from(await get('/vendors/$id/'));
  Future<dynamic> cartCalculate(List<Map<String,dynamic>> items,{int? cityId,String currency='YER'})=>post('/cart/calculate/',{'items':items,if(cityId!=null)'city_id':cityId,'currency':currency});

  Future<List<Map<String,dynamic>>> addresses() async=>_results(await get('/addresses/'));
  Future<Map<String,dynamic>> createAddress(Map<String,dynamic> body) async=>Map<String,dynamic>.from(await post('/addresses/',body));
  Future<Map<String,dynamic>> updateAddress(int id,Map<String,dynamic> body) async=>Map<String,dynamic>.from(await patch('/addresses/$id/',body));
  Future<void> deleteAddress(int id) async{await delete('/addresses/$id/');}

  Future<List<Map<String,dynamic>>> orders() async=>_results(await get('/orders/'));
  Future<Map<String,dynamic>> orderDetail(int id) async=>Map<String,dynamic>.from(await get('/orders/$id/order_view/'));
  Future<Map<String,dynamic>> createOrder({required List<Map<String,dynamic>> items,required Map<String,dynamic> shippingAddress,String currency='YER',String paymentMethod='wallet',String couponCode=''}) async {final key='order-${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1<<30)}';return Map<String,dynamic>.from(await post('/orders/',{'items':items,'shipping_address':shippingAddress,'currency':currency,'payment_method':paymentMethod,if(couponCode.isNotEmpty)'coupon_code':couponCode},idempotencyKey:key));}
  Future<Map<String,dynamic>> confirmReceived(int orderId) async=>Map<String,dynamic>.from(await post('/orders/$orderId/confirm_received/',{}));

  Future<List<Map<String,dynamic>>> notifications() async=>_results(await get('/notifications/'));
  Future<void> markNotificationRead(int id) async{await post('/notifications/$id/mark_read/',{});}
  Future<List<Map<String,dynamic>>> conversations() async=>_results(await get('/conversations/'));
  Future<Map<String,dynamic>> createConversation(int vendorId,String subject) async=>Map<String,dynamic>.from(await post('/conversations/',{'vendor':vendorId,'subject':subject}));
  Future<Map<String,dynamic>> conversation(int id) async=>Map<String,dynamic>.from(await get('/conversations/$id/'));
  Future<Map<String,dynamic>> sendConversationMessage(int id,String body) async=>Map<String,dynamic>.from(await post('/conversations/$id/send_message/',{'body':body}));
  Future<List<Map<String,dynamic>>> messages() async=>_results(await get('/messages/'));
  Future<Map<String,dynamic>> sendMessage(int conversationId,String body) async=>Map<String,dynamic>.from(await post('/messages/',{'conversation':conversationId,'body':body}));
  Future<void> markMessageRead(int id) async{await post('/messages/$id/mark_read/',{});}
  Future<Map<String,dynamic>> support() async=>Map<String,dynamic>.from(await get('/support/'));
  Future<Map<String,dynamic>> sendSupportMessage(String body) async=>Map<String,dynamic>.from(await post('/support/messages/',{'body':body}));
  Future<Map<String,dynamic>> preferences() async=>Map<String,dynamic>.from(await get('/preferences/'));
  Future<Map<String,dynamic>> updatePreferences({String? currency,bool? notificationsEnabled}) async=>Map<String,dynamic>.from(await patch('/preferences/',{if(currency!=null)'currency':currency,if(notificationsEnabled!=null)'notifications_enabled':notificationsEnabled}));

  Future<List<Map<String,dynamic>>> orderChats() async=>_results(await get('/order-chats/'));
  Future<Map<String,dynamic>> orderChat(int id) async=>Map<String,dynamic>.from(await get('/order-chats/$id/'));
  Future<List<Map<String,dynamic>>> ensureOrderChats(int orderId) async=>_results(await post('/order-chats/ensure_for_order/',{'order_id':orderId}));
  Future<Map<String,dynamic>> sendOrderChatMessage(int id,String body) async=>Map<String,dynamic>.from(await post('/order-chats/$id/send_message/',{'body':body}));
  Future<void> markOrderChatRead(int id) async{await post('/order-chats/$id/mark_read/',{});}

  Future<Map<String,dynamic>> transfer({required String recipient,required double amount,String currency='YER',String note='',String? idempotencyKey}) async {final key=idempotencyKey??'transfer-${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1<<30)}';return Map<String,dynamic>.from(await post('/v2/accounting/transfers/',{'recipient':recipient.trim(),'amount':amount,'currency':currency,if(note.trim().isNotEmpty)'note':note.trim()},idempotencyKey:key));}
  Future<Map<String,dynamic>> gift({required String recipient,required double amount,String currency='YER',String message='',String? idempotencyKey}) async {final key=idempotencyKey??'gift-${DateTime.now().microsecondsSinceEpoch}-${Random().nextInt(1<<30)}';return Map<String,dynamic>.from(await post('/v2/accounting/gifts/',{'recipient':recipient.trim(),'amount':amount,'currency':currency,if(message.trim().isNotEmpty)'message':message.trim()},idempotencyKey:key));}
  Future<List<Map<String,dynamic>>> gifts() async=>_results(await get('/gifts/'));
  Future<Map<String,dynamic>> giftLookup(String phone) async=>Map<String,dynamic>.from(await post('/gifts/lookup/',{'receiver_phone':phone}));
  Future<Map<String,dynamic>> createGift({required String receiverPhone,required double amount,String message=''}) async {final r=await transfer(recipient:receiverPhone,amount:amount,note:message);_legacyTransferConfirmationPending=true;final recipient=r['recipient'];final recipientName=recipient is Map?'${recipient['name']??receiverPhone}':receiverPhone;return {'id':r['journal']??'', 'recipient_name':recipientName, 'recipient_phone':receiverPhone, 'amount':r['amount']??amount, 'currency':r['currency']??'YER', 'success':r['success']??true, 'message':r['message']??'تم تنفيذ التحويل وتسجيله في القيد المحاسبي.', ...r};}
  Future<Map<String,dynamic>> confirmGift(int id) async {if(_legacyTransferConfirmationPending){_legacyTransferConfirmationPending=false;return {'success':true,'type':'transfer','id':id,'message':'تم تنفيذ التحويل بالفعل عبر القيد المحاسبي.'};}return Map<String,dynamic>.from(await post('/gifts/$id/confirm/',{}));}
  Future<Map<String,dynamic>> cancelGift(int id) async=>Map<String,dynamic>.from(await post('/gifts/$id/cancel/',{}));

  List<Map<String,dynamic>> _results(dynamic data){if(data is List)return List<Map<String,dynamic>>.from(data.map((e)=>Map<String,dynamic>.from(e)));if(data is Map&&data['results'] is List)return List<Map<String,dynamic>>.from((data['results'] as List).map((e)=>Map<String,dynamic>.from(e)));return [];}
}