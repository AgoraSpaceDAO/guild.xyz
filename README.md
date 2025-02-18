# **Guild.xyz Interface**  

<div align="left">

[![Code Check](https://github.com/guildxyz/guild.xyz/actions/workflows/code-check.yml/badge.svg)](https://github.com/guildxyz/guild.xyz/actions/workflows/code-check.yml)
[![Website](https://img.shields.io/badge/Website-Guild.xyz-0077b5?style=flat-square&logo=google-chrome&logoColor=white)](https://guild.xyz)
[![Docs](https://img.shields.io/badge/Docs-docs.guild.xyz-4CAF50?style=flat-square&logo=bookstack&logoColor=white)](https://docs.guild.xyz/)
[![X (Twitter)](https://img.shields.io/badge/X-@Guildxyz-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/guildxyz)
[![Discord](https://img.shields.io/badge/Discord-Join_Guild.xyz-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/KUkghUdk2G)


</div>

---

## 🚀 **Overview**  

**Guild.xyz** is an open-source interface for **platformless membership management**.

### 🔑 **Key Dependencies Overview**
- **Framework**: React with Next.js  
- **Styling**: Chakra UI *(migrating to Tailwind CSS & Radix UI)*, Phosphor Icons, Framer Motion  
- **State Management**: SWR *(fetching & caching)*, React Hook Form *(form state)*, Jotai *(global state)*  
- **Testing**: Storybook – [Live Deployment](https://guildxyz.github.io/guild.xyz), Playwright  
- **Web3 Integration**: Viem, Wagmi *(connection management)*  
- **Graphics & Data Visualization**: Visx, Three.js  
- **Deployment**: Vercel  
- **Product Analytics**: PostHog  
- **Error Monitoring**: BugSnag  

---

## 🛠 **Development Setup**

### **Running Locally**  

1️⃣ Install dependencies:  
```bash
npm i
```
2️⃣ Start the development server:  
```bash
npm run dev
```
3️⃣ If you don't have secret environment variables, copy `.env.example` to `.env.local`  
4️⃣ Open [http://localhost:3000](http://localhost:3000) in your browser  

📌 **For Windows Users**  
If you encounter the error `ERR_OSSL_EVP_UNSUPPORTED`, run:
```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm i --force
npm run dev
```

> ⚠️ **Warning:**  
> We've recently enabled `strict` and `strictNullChecks` in tsconfig.  
> TypeScript issues might appear during development. Fixes are welcome via PRs! 😉

---

## 🔐 **Getting Secret Environment Variables (Core Team Members Only)**

1️⃣ Get added to the team on **Vercel**  
2️⃣ Install the latest **Vercel CLI**:  
```bash
npm i vercel@latest -g
```
3️⃣ Link the project:  
```bash
vercel link
```
4️⃣ Pull environment variables:  
```bash
vercel env pull .env.local
```

---

## 📝 **Code Guidelines**  

- Always **use design system values** for styling where possible  
- Follow the existing **file naming & folder structure** conventions  

### **Committing**  
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) *(recommended but not required)*  
- Use **present tense** in commit messages  
- Review your changes before committing  
- Use `--no-verify` to bypass the pre-commit hook in case of WIP commits  

---

## 🔄 **PR Flow**  

✔️ **Start with a draft PR** – create it as soon as you start a new branch  
✔️ **Vercel provides unique preview links** – share them with the team when needed  
✔️ **Self-review before requesting feedback** – clean up code, refactor, and add comments  
✔️ **Mark as "Ready for Review"** once finalized, or merge if you have permission  

---

## 📬 **Stay Connected**  

<p align="left">
  <a href="https://guild.xyz">
    <img src="https://img.shields.io/badge/Website-0077b5?logo=google-chrome&logoColor=white&style=for-the-badge" alt="Website">
  </a>
  <a href="https://docs.guild.xyz/">
    <img src="https://img.shields.io/badge/Docs-4CAF50?logo=bookstack&logoColor=white&style=for-the-badge" alt="Docs">
  </a>
  <a href="https://x.com/guildxyz">
    <img src="https://img.shields.io/badge/X-000000?logo=x&logoColor=white&style=for-the-badge" alt="X (formerly Twitter)">
  </a>
  <a href="https://discord.gg/KUkghUdk2G">
    <img src="https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white&style=for-the-badge" alt="Discord">
  </a>
</p>

