#!/bin/zsh
# Kullanım: capture.sh <udid> <iphone|ipad> <lang> <app_path>
U=$1; KIND=$2; L=$3; APP=$4
OUT="${0:A:h}/raw/$KIND/$L"; mkdir -p "$OUT"
case $L in tr) LOC=tr_TR;; en) LOC=en_US;; ar) LOC=ar_SA;; esac
xcrun simctl boot $U 2>/dev/null; xcrun simctl bootstatus $U >/dev/null
xcrun simctl status_bar $U override --time "9:41" --batteryState charged --batteryLevel 100 --wifiBars 3 --cellularBars 4
xcrun simctl uninstall $U com.zarfim.app; xcrun simctl install $U "$APP"
launch() { xcrun simctl terminate $U com.zarfim.app 2>/dev/null; xcrun simctl launch $U com.zarfim.app -shotRoute "$R" -AppleLanguages "($L)" -AppleLocale $LOC >/dev/null; sleep ${1:-6}; }
R=""; launch 6; launch 7   # ikinci açılış RTL'yi uygular
i=0
for r in "" add-expense envelope/s-env-0 incomes two expenses add-envelope settings paywall; do
  i=$((i+1)); n=("01-home" "02-add-expense" "03-envelope" "04-incomes" "05-reports" "06-expenses" "07-new-envelope" "08-settings" "09-premium")
  R=$r; launch 8
  xcrun simctl io $U screenshot "$OUT/${n[$i]}.png" >/dev/null 2>&1
done
echo "$OUT"
