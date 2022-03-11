/*
 * Copyright (C) 2014 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

package com.example.mecollection;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.os.SystemClock;
import android.util.Log;
import android.view.KeyEvent;
import android.webkit.HttpAuthHandler;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.Nullable;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import io.reactivex.Completable;
import io.reactivex.CompletableEmitter;
import io.reactivex.CompletableObserver;
import io.reactivex.CompletableOnSubscribe;
import io.reactivex.CompletableSource;
import io.reactivex.Notification;
import io.reactivex.Observable;
import io.reactivex.ObservableEmitter;
import io.reactivex.ObservableOnSubscribe;
import io.reactivex.ObservableSource;
import io.reactivex.Observer;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.disposables.Disposable;
import io.reactivex.functions.Action;
import io.reactivex.functions.BiFunction;
import io.reactivex.functions.Consumer;
import io.reactivex.functions.Function;
import io.reactivex.schedulers.Schedulers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import retrofit2.Converter;


/*
 * Main Activity class that loads {@link MainFragment}.
 */

public class MainActivity extends Activity {
    private static final String TAG = "hzh";
    private int RED_KEY = 0;

    public class MyJavaScriptBridge {
        @JavascriptInterface
        public void showSource(String html) {
            //TODO 打印HTML
        }
        @JavascriptInterface
        public void showDescription(String str) {
            //TODO 描述
        }
    }

    WebViewClient mWebClient = new WebViewClient(){
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {

            try {
                URL url = new URL(request.getUrl().toString());
                URLConnection connection = url.openConnection();
                String contentType = connection.getContentType();
                if (contentType != null){
                    String temp = contentType.toLowerCase();
//                    Log.d(TAG,"GET contentType is :" + temp);
                    if (temp.contains("application/vnd.hbbtv.xhtml+xml")){
                        Log.v(TAG,"find is hbbtv type :" + temp);
                        contentType = contentType.replace("application/vnd.hbbtv.xhtml+xml",
                                "application/xhtml+xml");//不区分大小写的替换
                    }
                    if (temp.contains("charset=utf-8")) {
                        contentType = contentType.replaceAll("(?i)" + "charset=utf-8", "");//不区分大小写的替换
                    }
                    if (contentType.contains(";")) {
                        contentType = contentType.replaceAll(";", "");
                        contentType = contentType.trim();
                    }
                    return new WebResourceResponse(contentType, connection.getHeaderField("encoding"), connection.getInputStream());
                }
            } catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
//            view.loadUrl("javascript:window.toolbox.showSource("
//                    + "document.getElementsByTagName('html')[0].innerHTML);");
            view.loadUrl("javascript:window.toolbox.getKeyCode("
                    + "window.VK_RED);");
//            view.loadUrl("file:///android_asset/hbbtv_polyfill/index.html");
//            String javaScript = "";
//            try {
//                InputStream instream =  getResources().getAssets().open("hbbtv_polyfill/keyevent-init.js");
//                InputStreamReader inputreader = new InputStreamReader(instream);
//                BufferedReader buffreader = new BufferedReader(inputreader);
//                String line;
//                while (( line = buffreader.readLine()) != null) {
//                    javaScript += line;
//                }
//                instream.close();
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//            view.loadUrl("javascript:"
//                    + javaScript);
            super.onPageFinished(view, url);
        }

        @Override
        public boolean shouldOverrideKeyEvent(WebView view, KeyEvent event) {
            Log.d(TAG, "Get key: " + event.getKeyCode()
                    + "RED key :" + RED_KEY);
            long now = SystemClock.uptimeMillis();

            if (event.getKeyCode() == 46){
                view.loadUrl("javascript: document.dispatchEvent(new KeyboardEvent(\"keydown\", {"
                        + "bubbles: true,cancelable: true,keyCode:"
                        + RED_KEY + ",}));");
                return true;
            }

            return super.shouldOverrideKeyEvent(view, event);
        }


        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
//            view.loadUrl("file:///android_asset/hbbtv_polyfill/index.html");
            super.onPageStarted(view, url, favicon);
        }


        //        private WebResourceResponse getNewResponse(String url, Map<String, String> headers) {
//
//            try {
//                OkHttpClient httpClient = new OkHttpClient();
//
//                Request.Builder builder = new Request.Builder()
//                        .url(url.trim());
//
//                Set<String> keySet = headers.keySet();
//                for (String key : keySet) {
//                    builder.addHeader(key, headers.get(key));
//                }
//
//                Request request = builder.build();
//
//                final Response response = httpClient.newCall(request).execute();
//
//                String contentType = response.header("Content-Type", response.body().contentType().type());
//                String temp = contentType.toLowerCase();
////                Log.d(TAG,"conentType is :" + temp);
//                if (temp.contains("application/vnd.hbbtv.xhtml+xml")){
//                    Log.d(TAG,"find is hbbtv type :" + temp);
//                    contentType = contentType.replace("application/vnd.hbbtv.xhtml+xml",
//                            "application/xhtml+xml");//不区分大小写的替换
//                }
//                if (temp.contains("charset=utf-8")) {
//                    contentType = contentType.replaceAll("(?i)" + "charset=utf-8", "");//不区分大小写的替换
//                }
//                if (contentType.contains(";")) {
//                    contentType = contentType.replaceAll(";", "");
//                    contentType = contentType.trim();
//                }
//                Log.d(TAG,"after handle contentType is :" + contentType);
//                return new WebResourceResponse(
//                        contentType,
//                        response.header("Content-Encoding", "utf-8"),
//                        response.body().byteStream()
//                );
//
//            } catch (Exception e) {
//                return null;
//            }
//
//        }


    };


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        WebView mWebView = findViewById(R.id.webview);
        WebSettings webSettings = mWebView.getSettings();
        //如果访问的页面中要与Javascript交互，则webview必须设置支持Javascript
        webSettings.setJavaScriptEnabled(true);

        //设置自适应屏幕，两者合用
        webSettings.setUseWideViewPort(true); //将图片调整到适合webview的大小
        webSettings.setLoadWithOverviewMode(true); // 缩放至屏幕的大小

        webSettings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.SINGLE_COLUMN); //支持内容重新布局

        //缩放操作
        webSettings.setSupportZoom(true); //支持缩放，默认为true。是下面那个的前提。
        webSettings.setBuiltInZoomControls(true); //设置内置的缩放控件。若为false，则该WebView不可缩放
        webSettings.setDisplayZoomControls(false); //隐藏原生的缩放控件
//        webSettings.setTextZoom(2);//设置文本的缩放倍数，默认为 100

//        webSettings.setStandardFontFamily("");//设置 WebView 的字体，默认字体为 "sans-serif"
//        webSettings.setDefaultFontSize(20);//设置 WebView 字体的大小，默认大小为 16
//        webSettings.setMinimumFontSize(12);//设置 WebView 支持的最小字体大小，默认为 8

        // 5.1以上默认禁止了https和http混用，以下方式是开启
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        //其他操作
//        webSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK); //关闭webview中缓存
        webSettings.setAllowFileAccess(true); //设置可以访问文件
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true); //支持通过JS打开新窗口
        webSettings.setLoadsImagesAutomatically(true); //支持自动加载图片
//        webSettings.setDefaultTextEncodingName("utf-8");//设置编码格式
        webSettings.setGeolocationEnabled(true);//允许网页执行定位操作
//        webSettings.setUserAgentString("Mozilla/5.0 (Windows NT 10.0; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0");//设置User-Agent


        //不允许访问本地文件（不影响assets和resources资源的加载）
//        webSettings.setAllowFileAccess(false);
//        webSettings.setAllowFileAccessFromFileURLs(false);
//        webSettings.setAllowUniversalAccessFromFileURLs(false);
        mWebView.setWebViewClient(mWebClient);
        mWebView.setBackgroundColor(0);

        mWebView.addJavascriptInterface(new Object(){
            @JavascriptInterface
            public void getKeyCode(String key) {
                //TODO 打印HTML
                RED_KEY = Integer.parseInt(key);
                Log.d(TAG,"getKeyCode is" + key);
            }
        },"toolbox");

//        mWebView.loadUrl("file:///android_asset/hbbtv_polyfill/index.html");

//        mWebView.loadUrl("http://www.bilibili.com/");
//        mWebView.loadUrl("http://hbbtv.zdf.de/3satm/index.php");
        mWebView.loadUrl("http://hbbtv.zdf.de/3satm/redbutton.php");


    }

}
