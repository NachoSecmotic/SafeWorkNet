# Sort all the translations strings by ascending order.
sortTranslations:
	@python3 scripts/translations/sortJson.py \
	src/locale/translations/en.json \
	src/locale/translations/es.json
	@echo "DONE -> Translations Sorted!"

# Checks if all the languages implemented in the platform have the same translation strings.
testTranslations:
	@npm run test src/locale/translations/i18n.test.js
	@echo "DONE -> Translations Tested!"

# Performs the "sortTranslations" and "testTranslations" actions in sequence
sortAndTestTranslations: sortTranslations testTranslations
	@echo "DONE -> Translations Sorted & Tested!"