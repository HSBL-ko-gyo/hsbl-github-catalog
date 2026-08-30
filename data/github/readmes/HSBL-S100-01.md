## RGB LED bottom for ATOM HSBL-S100-01 

<img src="https://github.com/HSBL-ko-gyo/HSBL-S100-01/assets/128065816/365fb0f0-ef74-46b0-a098-ea23e190c30c" width="300" >

### 購入

<a href="https://sites.google.com/view/hsbl-s100/home#h.hl5y4fawha44" target="_blank">購入先一覧</a>

> ※このハードウェアは  
「Chameleon Key：画面付きマクロボタン」用に作成しましたが  
他の用途でもご使用いただけます。
Chameleon Key詳細は[製品ページ](https://sites.google.com/view/hsbl-s100/home)をご覧ください。  
><img src="https://github.com/HSBL-ko-gyo/HSBL-S101/assets/128065816/1e1bd703-e5ae-439e-a196-002bb3161693" width="320"  alt="HSBL-S100">  



### 概要


M5 ATOMデバイスの底面にRGB LED機能を追加します。  
  
RGBLEDのシリアル通信PINはATOMS3の場合PIN6にデフォルトで接続され、  
ハンダジャンパによりPIN5,PIN7に切り替えが可能です。(その場合JP6はカットしてください。)  

<img src="https://github.com/HSBL-ko-gyo/HSBL-S100-01/assets/128065816/79a9aaa9-b3f0-487e-90e0-33cfae15e57a" width="300" >

### 回路

<a href="https://github.com/HSBL-ko-gyo/HSBL-S100-01/tree/main/circuit" target="_blank">HSBL-S100-01/circuit/</a>

### 光拡散部3Dデータ

<a href="https://github.com/HSBL-ko-gyo/HSBL-S100-01/tree/main/3D" target="_blank">HSBL-S100-01/3D/</a>

| 項目       | 詳細       |
|------------|------------|
| 製造業者 | JLCPCB  |
| 3Dテクノロジー | SLA(樹脂)  |
| 材料       | 8001樹脂   |
| 色         | 透明       |
| 表面仕上げ   | いいえ     |



### WEB ツール

ATOMS3で使用する場合、OSSの<a href="https://hsbl-ko-gyo.github.io/HSBL-S101/" target="_blank">HSBL-S101 Chameleon WEBtool</a>にて  
RGB色の変更がブラウザから可能です。  
ファームウェア書き込み機能も同ページより提供しています。  


### サンプルコード

<img src="https://github.com/HSBL-ko-gyo/HSBL-S100-01/assets/128065816/43bbba19-f389-453f-9e08-023c204dab4d" width="300" >

``` C++
#include <Adafruit_NeoPixel.h>

#define PIN        6  // ネオピクセルピン S3の場合
//#define PIN        19 // ATOMの場合
#define NUMPIXELS  1  // ネオピクセルの数

// NeoPixelオブジェクトを作成
Adafruit_NeoPixel pixels(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  pixels.begin(); // NeoPixelの初期化
}

void loop() {
  pixels.setPixelColor(0, pixels.Color(255, 0, 0)); // 赤色
  pixels.show();
  delay(500);

  pixels.setPixelColor(0, pixels.Color(0, 255, 0)); // 緑色
  pixels.show();
  delay(500);

  pixels.setPixelColor(0, pixels.Color(0, 0, 255)); // 青色
  pixels.show();
  delay(500);
}
```
