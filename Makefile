.PHONY: backend-verify frontend-verify

backend-verify:
	@cd backend && \
		pylint --rcfile=.pylintrc routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && \
		black --check . && \
		pytest -v

frontend-verify:
	@cd frontend && \
		npm run lint && \
		npm run build
