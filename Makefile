all:
	npx crx pack -p ~/.ssh/extensions.pem ./src
	npx web-ext sign -s ./src
