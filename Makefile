.PHONY: backend-verify frontend-verify

backend-verify:
	@cd backend && \
		ruff check routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && \
		mypy routers/ services/ core/ schemas/ main.py db_models.py db_config.py dependencies.py && \
		bandit -r routers/ services/ core/ -ll && \
		pytest -v

frontend-verify:
	@cd frontend && \
		npm run lint && \
		npm run build
