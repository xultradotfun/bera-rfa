# Berachain RFA Allocations Explorer

A web application to explore and track BERA token allocations through the Request for Allocation (RFA) program. View it live at [bera-rfa.vercel.app](https://bera-rfa.vercel.app).

## Features

- 📊 Real-time tracking of BERA token allocations
- 💰 Live BERA price updates from DEXScreener
- 🔍 Search functionality for projects
- 🔄 Sorting by project name or allocation amount
- 🖼️ Twitter profile integration
- 📱 Responsive design for all devices

## Development

This is a Next.js project bootstrapped with `create-next-app`.

### Prerequisites

- Node.js 18+
- npm or yarn

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/xultradotfun/bera-rfa.git
cd bera-rfa
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

### Adding or Updating Project Data

The project data is stored in `/public/data/rfa_allocations.csv`. To add or update project information:

1. Fork the repository
2. Edit `rfa_allocations.csv` following this format:

```csv
project_name,bera_amount
@project_twitter_handle,allocation_amount
```

Requirements:

- `project_name`: Must include the @ symbol (e.g., @project_name)
- `bera_amount`: Numeric value (use 0 for unconfirmed allocations)
- Keep the CSV header row intact
- Maintain alphabetical order for easier review

3. Create a pull request with your changes
4. Include sources or verification for the allocation data in your PR description

Example entry:

```csv
@example_project,150000.00
```

### Code Contributions

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add: brief description of your changes"
```

4. Push to your fork:

```bash
git push origin feature/your-feature-name
```

5. Open a pull request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Update documentation as needed
- Add comments for complex logic
- Test your changes thoroughly

## License

MIT License - feel free to use this project as you wish.

## Acknowledgments

- Data curated by [@0x_ultra](https://twitter.com/0x_ultra)
- Built with Next.js, Tailwind CSS, and TypeScript
- Deployed on Vercel
