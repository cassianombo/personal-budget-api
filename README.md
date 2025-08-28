


```bash
docker run --name personal-budget-api \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=personal-budget \
  -p 5432:5432 \
  -d postgres