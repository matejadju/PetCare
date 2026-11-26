from fastapi import FastAPI

app = FastAPI(
    title="PetCare Health Service",
    description="Microservice for managing pet vaccinations and medications.",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "service": "Health Service",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}