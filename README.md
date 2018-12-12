# CalaveraRemake
### Allgemeine Informationen

`CalaveraRemake` ist ein, durch das Softwareengeneering-Modul entstandendes, Projekt, welches die Idee des ursprünglichen Calavera-Projektes aufgreift und versucht, eine plug-and-play, throw-away Entwicklungsumgebung für Studenten bereitzustellen. 
Ziel ist es, dass über eine Weboberfläche das Image zusammengestellt werden kann und der Student über einen Link sich seinen eigenen Container für seine Projekt-Gruppe starten kann. Dabei kann der Student direkt über einen VNC-Viewer auf seine Umgebung zugreifen.

### Vorgehensweise
Nachdem das Projekt gecloned wurde, kann das Image erstellt werden, welches am Ende ca. 2.11GB groß ist. Die Größe kann, je nach Projektart und ausgewählten Komponenten, schwanken.

Ein Container kann über die Datei `run.sh`erstellt werden. Momentan sieht der Inhalt, wegen Testzwecken, wie folgt aus
```shell
docker run -d -p 5901:5901 -p 6901:6901 -e VNC_RESOLUTION=640x480 -e GIT_REPOS_URL=https://github.com/KMI16/Test.git -e GIT_USER_NAME=KMI16 -e GIT_PASSWORD=passwordkmi16 devops
```

#### Erklärung -e Parameter:

| -e Parameter   | Erklärung     |
| ---------------|---------------| 
| VNC_RESOLUTION | Damit kann die Auflösung für den VNC-Viewer gesetzt werden | 
| VNC_PASSWORD   | Damit kann das VNC Passwort gesetzt werden, welches zum Verbinden gebraucht wird      |              
| GIT_REPOS_URL  | Damit kann die URL zum Repository für dieses Projekt gesetzt werden      |
| GIT_USER_NAME  | Damit kann der Nutzername für den GIT-Account gesetzt werden |
| GIT_PASSWORD   | Damit kann das Password für den GIT-Account gesetzt werden | 

`devops` ist der Name des Images, welches erstellt wurde. Auch das kann angepasst werden.

### Benutzung des Containers - Beispiel Java + Netbeans
Nachdem der Container gestartet wurde, kann mittels eines VNC-Viewers auf `localhost:5901` connected werden. Dann sollte ein geläufiger Ubuntu-Desktop sichtbar sein, mit einem Order `Projekt` auf dem Desktop. In diesem Order werden später die `src` Dateien liegen und es befindet sich bereits ein Order `scripts` darin, in dem sich u.a. Scripte zum pushen und pullen des Source-Codes auf Git befinden.

Vor jeder Nutzung sollte in einem Terminal `gitpull.sh` ausgeführt werden, um Git zu knofigurieren und die Sourcen zu laden. Nach dem ausführen, sollte sich der o.g. `src`Ordner an der richtigen Stelle befinden.

Außerdem befindet sich auf dem Desktop eine Netbeans-Verknüpfung. Diese kann geöffnet werden und ggf. das Projekt aus dem `src` Ordner importiert werden.

Nach dem Arbeiten, sollten die Daten wieder auf Git geladen werden. Dazu kann der Befehl `gitpush.sh <message>` genutzt werden. Beispielsweise `gitpush.sh "Added the new E-Mail feature`. 

**Wichtig**: Der Container muss selbstständig heruntergefahren / beendet werden. Das Schließen der VNC-Verbindung führt noch nicht zum stoppen des Containers. Der Container kann über folgende Befehle gestoppt werden:
```sh
docker ps -a // listet alle aktiven Container auf
docker stop <containerid>
docker rm <containerid>
```
Oder man stoppt und löscht direkt alle Container.
```sh
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```
