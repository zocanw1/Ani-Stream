Set WshShell = CreateObject("WScript.Shell")
' Menjalankan Batch file yang kita buat tadi tapi tanpa jendela hitam (0)
WshShell.Run "cmd /c JALANKAN_WEBSITE.bat", 0, False
