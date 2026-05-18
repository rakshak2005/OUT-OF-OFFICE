import bcrypt from 'bcryptjs';

const hash = '$2b$10$kAxZ1MLg5rKD3.rfpf1vmesUENP6YWdDACafnvEDlN/zz7icpkBYG';
const check = async () => {
  const isMatch = await bcrypt.compare('manager123', hash);
  console.log('Match manager123?', isMatch);
};

check();
