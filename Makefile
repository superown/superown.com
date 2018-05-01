export PATH := $(shell npm bin):$(PATH)
REGION := ap-southeast-1
BUCKET := superowned
VERSION = $(shell git describe --always)

dev:
	npm run dev

deploy:
	npm run build
	aws s3 --profile superown sync dist/ s3://$(BUCKET)/superown \
	--acl public-read
	@echo http://$(BUCKET).s3-website-$(REGION).amazonaws.com/

invalidate: deploy
	@aws --profile superown cloudfront create-invalidation --distribution-id E1P5S6LO2WB92 \
	--invalidation-batch "{ \"Paths\": { \"Quantity\": 1, \"Items\": [ \"/*\" ] }, \"CallerReference\": \"$(shell date +%s)\" }"
	@echo Deployed to: https://$(BUCKET).com
