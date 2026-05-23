Option Explicit

Dim shell, fso, root, logsDir, backCommand, frontCommand

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

root = fso.GetParentFolderName(WScript.ScriptFullName)
logsDir = root & "\logs"

If Not fso.FolderExists(logsDir) Then
  fso.CreateFolder logsDir
End If

backCommand = "cmd /c cd /d """ & root & """ && npm run dev:back >> """ & logsDir & "\dev-back.log"" 2>&1"
frontCommand = "cmd /c cd /d """ & root & """ && npm run dev >> """ & logsDir & "\dev-front.log"" 2>&1"

shell.Run backCommand, 0, False
WScript.Sleep 2000
shell.Run frontCommand, 0, False
