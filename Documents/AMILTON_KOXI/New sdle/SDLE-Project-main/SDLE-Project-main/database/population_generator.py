import random as rand

first_names = [
  'Ana', 'Joao', 'Mariana', 'Pedro', 'Sofia', 'Miguel', 'Ines', 'Tiago', 'Beatriz', 'Rafael',
  'Carolina', 'Francisco', 'Matilde', 'Tomas', 'Marta', 'Diogo', 'Catarina', 'Lucas', 'Lara', 'Gabriel',
  'Rita', 'Goncalo', 'Madalena', 'Daniel', 'Leonor', 'Andre', 'Clara', 'Guilherme', 'Laura', 'Jose',
  'Ana Carolina', 'Hugo', 'Maria', 'David', 'Constanca', 'Simao', 'Carla', 'Leonardo', 'Bianca', 'Luis',
  'Isabel', 'Salvador', 'Camila', 'Rui', 'Erica', 'Alexandre', 'Rosa', 'Mario', 'Vitoria', 'Fabio',
  'Monica', 'Andrea', 'Nuno', 'Vanessa', 'Luisa', 'Paulo', 'Tatiana', 'Diana', 'Joaquim', 'Filipa',
  'Samuel', 'Liliana', 'Jaime', 'Daniela', 'Bruno', 'Olivia', 'Eduardo', 'Lucia', 'Vasco', 'Sara',
  'Fernando', 'Vera', 'Cristiano', 'Ricardo', 'Aurora', 'Martim', 'Juliana', 'Antonio', 'Eva', 'Manuel',
  'Helena', 'Artur', 'Nadia', 'Santiago', 'Teresa', 'Fernanda', 'Viviana', 'Duarte', 'Filomena', 'Simone',
  'Helder', 'Mafalda', 'Simara', 'Raul', 'Tania', 'Emanuel', 'Alice', 'Alexandra', 'Sergio', 'Cecilia'
]

last_names = [
  'Silva', 'Santos', 'Pereira', 'Costa', 'Oliveira', 'Fernandes', 'Gomes', 'Rodrigues', 'Martins', 'Lopes',
  'Almeida', 'Nunes', 'Cardoso', 'Pinto', 'Rocha', 'Cunha', 'Barbosa', 'Mendes', 'Moreira', 'Carvalho',
  'Teixeira', 'Coelho', 'Neves', 'Mota', 'Araujo', 'Dias', 'Soares', 'Ribeiro', 'Matos', 'Freitas',
  'Monteiro', 'Figueiredo', 'Miranda', 'Correia', 'Ferreira', 'Pires', 'Fonseca', 'Andrade', 'Couto',
  'Vieira', 'Lima', 'Reis', 'Sousa', 'Goncalves', 'Moura', 'Baptista', 'Dantas', 'Borges', 'Faria',
  'Machado', 'Cruz', 'Campos', 'Pinheiro', 'Marques', 'Jesus', 'Vargas', 'Carmo', 'Esteves', 'Azevedo',
  'Amaral', 'Ramos', 'Lima', 'Lourenco', 'Loureiro', 'Rosa', 'Fidalgo', 'Cordeiro', 'Tavares', 'Castro',
  'Branco', 'Vilaca', 'Veiga', 'Melo', 'Aguiar', 'Serra', 'Vasconcelos', 'Leite', 'Fialho', 'Domingues',
  'Abreu', 'Xavier', 'Garcia', 'Calado', 'Medeiros', 'Parreira', 'Raposo', 'Nogueira', 'Antunes', 'Cavaco',
  'Laranjeira', 'Salgado', 'Alves', 'Bento', 'Tome', 'Barros', 'Figueira', 'Fernando', 'Ramos', 'Corona'
]

item_names = [
  'Pao', 'Leite', 'Ovos', 'Arroz', 'Feijao', 'Azeite', 'Cafe', 'Acucar', 'Sal', 'Manteiga',
  'Queijo', 'Presunto', 'Frango', 'Carne', 'Peixe', 'Tomate', 'Cebola', 'Alho', 'Batata', 'Cenoura',
  'Maca', 'Banana', 'Laranja', 'Morango', 'Abacaxi', 'Melancia', 'Uva', 'Pessego', 'Mel', 'Iogurte',
  'Queijo ralado', 'Massa', 'Molho de tomate', 'Ketchup', 'Mostarda', 'Maionese', 'Vinagre', 'Louro', 'Oregaos', 'Salsa',
  'Pimenta', 'Pimentao', 'Canela', 'Cravo', 'Noz-moscada', 'Gengibre', 'Farinha', 'Fermento', 'Chocolate', 'Bolachas',
  'Cereal', 'Suco', 'Agua', 'Refrigerante', 'Cerveja', 'Vinho', 'Detergente', 'Sabao em po', 'Esponja', 'Papel higienico',
  'Shampoo', 'Condicionador', 'Sabonete', 'Escova de dentes', 'Pasta de dentes', 'Fio dental', 'Desodorante', 'Laminas de barbear',
  'Papel toalha', 'Aluminio', 'Filme plastico', 'Sacos de lixo', 'Velas', 'Fosforos', 'Pilhas', 'Lampadas', 'Plantas', 'Flores',
  'Fertilizante', 'Vaso', 'Areia para gato', 'Racao para animais', 'Petiscos', 'Coleira', 'Brinquedos', 'Medicamentos', 'Curativos',
  'Xampu para animais', 'Tapete', 'Almofadas', 'Toalhas de mesa', 'Guardanapos', 'Copos descartaveis', 'Pratos descartaveis', 'Talheres descartaveis', 'Sacolas reutilizaveis'
]

users = []
lists = []
userlists = []
items = []

def generate_user(): 
  first = pick_random_from(first_names)
  last = pick_random_from(last_names)
  name = first + " " + last
  username =  first  + last + str(rand.randrange(0,9999))
  userID = len(users)
  return [userID, username,name]

def generate_user_insert():
  user = generate_user()
  users.append(user)
  return "INSERT INTO User VALUES ("+ str(user[0]) + ",'"  + user[1] + "','" + user[2] + "','123');"

def generate_list_insert():
  listID = len(lists)
  lists.append([listID, 'Lista ' + str(listID)])
  lines = []
  lines.append("INSERT INTO ShoppingList VALUES (" + str(listID) + ", 'Lista " + str(listID) +"');")
  owner_amount = rand.randrange(1,5)
  while(owner_amount > 0):
    user = pick_random_from(users)
    userlistID = len(userlists)
    newuserlist = [user[0], listID]
    if newuserlist not in userlists:
      userlists.append([user[0],listID])
      owner_amount -= 1
      lines.append("INSERT INTO UserList VALUES (" + str(userlistID) + "," + str(user[0]) + "," + str(listID) +");")
  return lines

def populate_list(list):
  itemAmount = rand.randrange(1,6)
  lines = []
  while(itemAmount > 0):
    itemID = len(items);
    item = [itemID, pick_random_from(item_names), rand.randrange(0,5), list]
    items.append(item)
    lines.append("INSERT INTO Item VALUES (" + str(item[0]) + ",'" + item[1] + "'," + str(item[2]) + "," + str(item[3]) + ");" )
    itemAmount -= 1
  return lines

def pick_random_from(list):
  return list[rand.randrange(0,len(list))]

def main():
  f = open("populate.sql", "w")
  print("Select user amount:")
  user_amount = int(input())
  print("\n Select list amount:")
  list_amount = int(input())
  print("\n")
  while(user_amount > 0):
    line = generate_user_insert()
    f.write(line + "\n")
    print(line)
    user_amount -= 1
  print("\n")
  while(list_amount > 0):
    print("\n")
    for line in generate_list_insert():
      f.write(line + "\n")
      print(line)
    list_amount -= 1
  print("\n")
  for list in lists:
    print("\n")
    for line in populate_list(list[0]):
      f.write(line + "\n")
      print(line)

main()