PLUGIN_UUID = com.fghbittencourt.claude-needs-you
LOG_DIR = $(HOME)/Library/Application\ Support/com.elgato.StreamDeck/Plugins/$(PLUGIN_UUID).sdPlugin/logs
LOG_FILE = $(LOG_DIR)/$(PLUGIN_UUID).0.log

.PHONY: install build watch link restart logs blink clear

install:
	npm install

build:
	npm run build

watch:
	npm run watch

link:
	streamdeck link $(CURDIR)/$(PLUGIN_UUID).sdPlugin

restart:
	streamdeck restart $(PLUGIN_UUID)

logs:
	tail -f $(LOG_FILE)

blink:
	/usr/bin/curl -s -X POST localhost:37999/blink

clear:
	/usr/bin/curl -s -X POST localhost:37999/clear
