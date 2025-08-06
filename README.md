# 🎯 Blacktop Blackout - OverWatch-Ops System

> **Ultimate intelligent command center for asphalt paving business operations**

The Blacktop Blackout project is a **Composable/Pluggable Enterprise Platform** designed as the ultimate intelligent command center for asphalt paving businesses. This system features dynamically loadable modules, allowing users to add, remove, enable, and disable functionalities via an integrated in-app marketplace.

## 🚀 Project Vision

Create the most comprehensive, AI-driven operational intelligence platform for asphalt paving businesses, featuring:

- **OverWatch-Ops System**: Central command & control hub with real-time monitoring
- **Dynamic Module System**: Pluggable architecture with secure sandboxed modules
- **AI-Powered Analytics**: Predictive maintenance, cost optimization, and scheduling
- **3D Scanning & Defect Detection**: PavementScan Pro integration
- **Multi-Platform Support**: Flutter mobile, React web, Node.js backend

## 🏗️ Architecture

### Monorepo Structure
```
blacktop-blackout-monorepo/
├── apps/
│   ├── api/              # Node.js/Express backend
│   ├── web-app/          # React/Vite web application
│   └── mobile-app/       # Flutter mobile application
├── libs/
│   ├── shared/           # Shared utilities and types
│   ├── ui/               # UI components and theme
│   ├── api/              # API client libraries
│   └── core/             # Core business logic
└── docs/                 # Documentation
```

### Core Technologies

- **Backend**: Node.js, Express.js, PostgreSQL/PostGIS, Socket.IO
- **Frontend**: React/Vite, Flutter, TypeScript
- **Database**: PostgreSQL with PostGIS extensions
- **Plugin System**: Dynamic module loading with isolated-vm
- **Security**: JWT authentication, RBAC, cryptographic signatures
- **CI/CD**: Nx monorepo with automated testing and deployment

## 🎨 Design Theme

The UI/UX foundation is derived from the `asphalt-guardian-suite` repository, featuring:

- **Industrial Asphalt Theme**: Dark theme with vibrant cyan and orange accents
- **ISAC OS Aesthetic**: Vigilant, data-rich, and modern interface
- **Military/Civilian Toggle**: Dynamic terminology switching
- **Responsive Design**: Mobile-first approach with desktop optimization

## 🔧 Core Features

### OverWatch-Ops System
- **Real-time Dashboard**: Live operational intelligence and monitoring
- **Live Cost Center**: Automatic expense tracking (wages, materials, fuel)
- **GPS Tracking**: Employee, vehicle, and equipment location monitoring
- **Environmental Intelligence**: Weather radar, AI-driven recommendations
- **Phone Usage Monitoring**: Work-focused productivity tracking
- **Automated Timekeeping**: Geofencing-based clock-in/out

### PavementScan Pro
- **3D Mobile Scanning**: ARKit/ARCore/LiDAR surface scanning
- **AI Defect Detection**: Automated crack, pothole, and damage analysis
- **Visual Marking**: Color-coded defect highlighting on 3D models
- **Report Generation**: Automated geo-tagged reports (PDF, PNG, DXF, GeoJSON)

### Business Intelligence
- **Predictive Analytics**: Equipment maintenance and failure prediction
- **Cost Optimization**: Real-time expense tracking and forecasting
- **Resource Allocation**: AI-driven scheduling and workload balancing
- **Performance Monitoring**: Employee and equipment efficiency metrics

## 🔌 Plugin Architecture

### Dynamic Module System
- **Secure Sandboxing**: isolated-vm for untrusted code execution
- **Cryptographic Verification**: Digital signatures for all modules
- **Hot-swappable**: Load/unload modules without system restart
- **Marketplace Integration**: In-app module discovery and installation

### Available Module Types
- **Backend Modules**: Node.js APIs and services
- **Frontend Modules**: React components and Flutter widgets
- **Hybrid Modules**: Full-stack functionality packages
- **Data Connectors**: External system integrations

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm 8+
- Flutter 3.10+
- PostgreSQL 14+ with PostGIS
- Redis (optional, for caching)

### Quick Start
```bash
# Clone the repository
git clone [repository-url]
cd blacktop-blackout-monorepo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev

# Or start individual services
npm run serve:api      # Backend API
npm run serve:web      # React web app
npm run serve:mobile   # Flutter app
```

### Environment Configuration
Key environment variables:
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blacktop_blackout_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_secret_key

# External APIs
WEATHER_API_KEY=your_weather_key
MAPS_API_KEY=your_maps_key

# Business Configuration
BUSINESS_ADDRESS="337 Ayers Orchard Road, Stuart, VA 24171"
SEALMASTER_ADDRESS="703 West Decatur Street, Madison, NC 27025"
```

## 📊 Business Domain

### Target Industry: Asphalt Paving & Maintenance
- **Primary Services**: Sealcoating, crack filling, line striping, patching
- **Equipment**: 1978 Chevy C30 with SK 550 tank, hot pour crack machines
- **Materials**: SealMaster PMM sealer, sand, prep seal, crack filler
- **Workforce**: 2 full-time, 1 part-time employee

### Key Metrics Tracked
- **Labor Costs**: $40-60/hour blended rate including overhead
- **Material Costs**: Real-time pricing from SealMaster supplier
- **Equipment Utilization**: Fuel consumption, maintenance schedules
- **Project Profitability**: Real-time cost tracking vs. estimates

## 🔐 Security Features

### Multi-layered Security
- **Authentication**: JWT with role-based access control (RBAC)
- **Authorization**: Granular permissions system
- **Data Protection**: Encryption at rest and in transit
- **Audit Logging**: Comprehensive activity tracking
- **Plugin Security**: Sandboxed execution with signature verification

### Compliance
- **Data Privacy**: GDPR/CCPA compliant data handling
- **Industry Standards**: SOC 2 Type II controls
- **Security Monitoring**: Real-time threat detection

## 🚀 Deployment

### Production Deployment
- **Container Support**: Docker and Kubernetes ready
- **Cloud Platforms**: AWS, Azure, GCP compatible
- **Database**: PostgreSQL with automated backups
- **CDN**: Static asset optimization and global delivery
- **Monitoring**: Application performance monitoring (APM)

### Scaling Strategy
- **Horizontal Scaling**: Microservices architecture
- **Database Sharding**: Multi-tenant data isolation
- **Caching**: Redis for session and data caching
- **Load Balancing**: High availability configuration

## 📚 Documentation

- [API Documentation](./docs/api/)
- [Plugin Development Guide](./docs/plugins/)
- [Deployment Guide](./docs/deployment/)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)

## 🤝 Contributing

We welcome contributions to the Blacktop Blackout project! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Code of Conduct
- Development process
- Pull request guidelines
- Testing requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- [x] Monorepo setup with Nx
- [x] Core API architecture
- [x] Plugin system foundation
- [ ] PostgreSQL/PostGIS integration
- [ ] React web application
- [ ] Flutter mobile application

### Phase 2: OverWatch-Ops System
- [ ] Real-time dashboard
- [ ] GPS tracking integration
- [ ] Cost center implementation
- [ ] Weather intelligence
- [ ] PavementScan Pro integration

### Phase 3: Advanced Intelligence
- [ ] AI/ML analytics
- [ ] Predictive maintenance
- [ ] Automated scheduling
- [ ] AR overlays
- [ ] Drone integration

### Phase 4: Production & Optimization
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Comprehensive testing
- [ ] Production deployment
- [ ] Documentation completion

## 📞 Support

For support, please contact:
- **Email**: support@blacktop-blackout.com
- **Issues**: [GitHub Issues](./issues)
- **Documentation**: [Project Wiki](./wiki)

---

**Built with ❤️ for the asphalt paving industry**