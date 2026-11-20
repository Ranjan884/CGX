# ChangeGuard — Technology Stack

The ChangeGuard architecture is structured as a decoupled, multi-tier enterprise platform built with industry-standard, production-proven technologies.

---

## 1. System Components & Versions

| Layer | Component | Version | Role in ChangeGuard |
|:---|:---|:---|:---|
| **Frontend UI/UX** | React | 19.0.1 | Single-Page Application (SPA) reactive user interface |
| | TypeScript | 7.0.2 / 5.7+ | Strict static type safety across entities, DTOs & APIs |
| | Vite | 8.3.0 | Modern ES-module build engine & dev server |
| | Tailwind CSS | 4.3.3 | Dark-first enterprise fintech design tokens & utility styles |
| | Motion for React | 12.23.24 | Hardware-accelerated micro-interactions & drawer transitions |
| | @xyflow/react | 12.12.0 | High-performance interactive React Flow topology graph |
| | Lucide React | 0.546.0 | Cohesive enterprise iconography |
| | Axios | 1.20.0 | HTTP client with RBAC request interceptors & error handlers |
| | React Router DOM | 7.18.4 | Client-side routing with breadcrumb management |
| **Backend Core** | Java | OpenJDK 17 / 21 | Strongly typed, high-concurrency enterprise backend runtime |
| | Spring Boot | 3.3.4 | Modern microservice framework, auto-configuration & REST APIs |
| | Spring Data JPA | 3.3.4 | Repository layer and entity lifecycle management |
| | Hibernate Core | 6.5.3 | Object-Relational Mapping (ORM) and schema validation |
| | Jakarta Validation | 3.0.2 | Input validation (`@Valid`, `@NotNull`, `@Min`, `@Max`) |
| | Jackson Core | 2.17.2 | High-throughput JSON serialization & deserialization |
| | SLF4J / Logback | 2.0.16 | Structured production logging and audit logging |
| **ML Microservice** | Python | 3.10 / 3.11 | Data science and scientific computing runtime |
| | FastAPI | 0.100+ | Asynchronous high-throughput REST inference server |
| | Uvicorn | 0.22+ | ASGI server hosting FastAPI |
| | Scikit-learn | 1.3.0+ | Machine learning algorithms (Random Forest, Logistic Regression) |
| | Pandas | 2.0.0+ | Dataframe preprocessing and feature extraction |
| | NumPy | 1.24.0+ | Vectorized numerical operations |
| | Joblib | 1.3.0+ | Efficient serialization of scikit-learn pipeline artifacts |
| | Matplotlib | 3.7.0+ | Generation of evaluation plots (ROC curve, confusion matrix) |
| **Persistence** | PostgreSQL | 15.4 / 15.6 | ACID-compliant relational storage for services, changes, incidents, audit logs |
| | Spring Boot H2 | 2.2.224 | In-memory zero-configuration testing & fallback persistence |
| **Containerization** | Docker | 24.0+ | Containerized multi-stage builds (`Dockerfile.backend`, `Dockerfile.ml`, `Dockerfile.frontend`) |
| | Docker Compose | 2.20+ | Multi-container orchestration (`docker-compose.yml`) |
