import whisper
import json
import os
import sys

# ================= 設定區 =================
# 1. 設定你的音檔資料夾路徑 (請確認這是不是你現在的路徑)
# 注意：前面加 r 是為了讓 Windows 路徑的反斜線不被轉義
base_path = r"C:\Users\8ihc8\Desktop\chronic_low_back_pain_maze\acknowledge_my_pain\audio\PT"

# 2. 設定你要處理的編號列表
# 例如：[1, 2, 3, 4, 5, 6, 7] 代表處理第 1 到第 7 個檔案
files_to_process = [2] 

# =========================================

print("正在載入 Whisper 模型 (Medium)... 這可能需要一點時間...")
try:
    # 使用 medium 模型比較準確，如果跑不動可以改用 "base"
    model = whisper.load_model("medium")
except Exception as e:
    print(f"❌ 模型載入失敗，請確認 FFmpeg 是否安裝成功: {e}")
    sys.exit(1)

print("模型載入完成，開始批次處理...")

for index in files_to_process:
    print("-" * 30)
    
    # 3. 智慧偵測檔名邏輯
    # 嘗試路徑 A: 沒有補零 (例如 1.m4a)
    path_a = os.path.join(base_path, f"{index}.m4a")
    # 嘗試路徑 B: 有補零 (例如 01.m4a)
    path_b = os.path.join(base_path, f"{index:02d}.m4a")

    audio_filename = ""
    json_filename = ""

    if os.path.exists(path_a):
        audio_filename = path_a
        json_filename = os.path.join(base_path, f"{index}.json")
    elif os.path.exists(path_b):
        audio_filename = path_b
        # 為了統一格式，輸出的 JSON 我們也可以統一補零，或者跟隨音檔
        json_filename = os.path.join(base_path, f"{index:02d}.json")
    else:
        print(f"⚠️ 跳過：找不到第 {index} 號音檔")
        print(f"   找過: {path_a}")
        print(f"   也找過: {path_b}")
        continue

    print(f"🎧 正在處理：{os.path.basename(audio_filename)} ...")

    try:
        # 4. 執行辨識 (指定中文，不加 prompt 以避免幻覺)
        result = model.transcribe(audio_filename, language="zh")

        # 5. 整理成網頁需要的格式
        web_subtitles = []
        for segment in result["segments"]:
            web_subtitles.append({
                "start": segment["start"],
                "end": segment["end"],
                "text": segment["text"].strip()
            })

        # 6. 存檔
        with open(json_filename, "w", encoding="utf-8") as f:
            json.dump(web_subtitles, f, ensure_ascii=False, indent=2)

        print(f"✅ 成功！已產生字幕檔：{os.path.basename(json_filename)}")

    except Exception as e:
        print(f"❌ 處理失敗：{e}")
        
print("=" * 30)
print("🎉 全部批次處理完成！")