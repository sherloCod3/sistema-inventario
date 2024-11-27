# **Sistema de Inventário - UPA Lençóis Paulista** 🏥📦  

Sistema de gestão de inventário desenvolvido para atender às necessidades da UPA de Lençóis Paulista.  
Com este sistema, é possível gerenciar bens patrimoniais e insumos de maneira eficiente, permitindo controle total sobre o ciclo de vida dos itens e facilitando auditorias e relatórios.

---

## **Stack Tecnológica** 🖥️⚙️

- **Frontend**:  
  - [React.js](https://react.dev/): ⚛️ Framework robusto para desenvolvimento de interfaces interativas.  
  - [TypeScript](https://www.typescriptlang.org/): 🛠️ Tipagem estática para melhor manutenção e escalabilidade do código.  
  - [Tailwind CSS](https://tailwindcss.com/): 🎨 Framework utilitário para criar interfaces responsivas e modernas.

- **Backend**:  
  - [Node.js](https://nodejs.org/): 🚀 Ambiente de execução JavaScript para APIs escaláveis.  
  - [Express.js](https://expressjs.com/): 🌐 Framework minimalista e performático para construção de APIs RESTful.  
  - [MongoDB](https://www.mongodb.com/): 🗄️ Banco de dados NoSQL flexível e escalável.

- **Autenticação**:  
  - [JWT](https://jwt.io/): 🔒 Autenticação segura e baseada em tokens.

---

## **Funcionalidades Principais** 🏆

### **Gestão de Inventário** 📋
- **CRUD Completo**: 🖊️ Criação, leitura, atualização e exclusão de itens, com validações para garantir a consistência dos dados.  
- **Numeração Flexível**: 🔢 Sistema adaptável para códigos patrimoniais, permitindo personalização de acordo com padrões locais.

### **Relatórios e Exportação** 📊
- Exportação de dados em formato **CSV** para auditorias ou integrações externas.  
- Relatórios detalhados com filtros personalizáveis.

### **Filtros e Paginação** 🔍
- Busca e organização de itens por categoria, localização ou status.  
- Paginação otimizada para grandes volumes de dados, garantindo desempenho.

### **Interface Modernizada** 📱💻
- **Responsividade**: Compatível com dispositivos móveis, tablets e desktops.  
- Design claro e intuitivo, facilitando a navegação.

### **Autenticação e Segurança** 🔐
- Login seguro utilizando autenticação baseada em **JWT**.  
- Controle de acesso para proteger os dados do sistema.

---

## **Pré-requisitos** 🛠️

Antes de começar, certifique-se de ter:  
- **Node.js** (versão 16 ou superior).  
- **MongoDB** em execução localmente ou em um serviço de nuvem.  
- Gerenciador de pacotes `npm` ou `yarn` instalado.

---

## **Instalação e Execução** ⚙️💡

### **1. Clone o Repositório** 📥
```bash
git clone https://github.com/sherloCod3/sistema-inventario.git
cd sistema-inventario
```

### **2. Instale as Dependências** 📦
#### Frontend:
```bash
cd frontend
npm install
```

#### Backend:
```bash
cd ../backend
npm install
```

### **3. Configure o Ambiente** 🔧
- Na pasta `backend`, copie o arquivo `.env.example` e renomeie para `.env`.  
- Preencha as variáveis de ambiente necessárias, como no exemplo abaixo:

```env
MONGO_URI=mongodb://localhost:27017/sistema-inventario
JWT_SECRET=sua-chave-secreta
PORT=3001
```

Certifique-se de que o **MongoDB** esteja em execução.

### **4. Execute o Projeto** ▶️
#### Backend:
```bash
cd backend
npm run dev
```

#### Frontend:
```bash
cd frontend
npm run dev
```

O sistema estará disponível nos seguintes endereços:  
- **Frontend**: `http://localhost:5173` 🌐  
- **Backend**: `http://localhost:3001` 🌐  

---

## **Credenciais Padrão** 🔑
Use as seguintes credenciais para testar o sistema:  
- **Username**: `admin`  
- **Senha**: `admin@123`  

---

## **Screenshots (Exemplos)** 📸

### **Tela Inicial**  
![Tela Login](https://github.com/sherloCod3/sistema-inventario/blob/develop/screenshots/Captura%20de%20imagem_20241127_160156.png)  
*Exemplo da tela de login.*

![Tela Inicial](https://github.com/sherloCod3/sistema-inventario/blob/develop/screenshots/Captura%20de%20imagem_20241127_155930.png)  
*Exemplo de como os itens do inventário são apresentados ao usuário.*

### **Exportação de Dados**  
![Exportação CSV](https://github.com/sherloCod3/sistema-inventario/blob/develop/screenshots/Captura%20de%20imagem_20241127_161656.png)  
*Demonstração do processo de exportação para CSV.*

---

## **Diferenciais** 🌟

- **Código modular e escalável**:  
  Estruturado para facilitar manutenções e novas funcionalidades.  

- **Padrões de qualidade**:  
  Organização baseada em boas práticas como MVC (Model-View-Controller).  

- **Flexibilidade**:  
  Pode ser facilmente adaptado para outras áreas, como escolas, clínicas ou escritórios.  

---

## **Próximos Passos** 📈

- Implementação de testes unitários e de integração.  
- Otimização do desempenho em bancos de dados com alto volume.  
- Adicionar notificações automáticas para itens com baixo estoque.  

---

## **Autor** 👨‍💻

Desenvolvido por [Alexandre Cavalari](https://github.com/sherloCod3) para a UPA de Lençóis Paulista.  

---

## **Contato** 📬

- **Email**: alexandre.cavalari@outlook.com  
- **LinkedIn**: https://linkedin.com/in/alexandre-cavalari-lp

---
