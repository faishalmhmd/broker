class Induk:
  __x = 0
  __y = 0
  def _init_(self, x=0, y=0):
    self.__x = x
    self.__y = y
  @property
  def x(self):
    return self.__x
  @x.setter
  def x(self, x):
    self.__x = x
  @property
  def y(self):
    return self.__y
  @y.setter
  def y(self, y):
    self.__y = y

  def tambah(x,y):
    return (x + y)
  def kurang(x, y):
    return (x - y)
class Anak(Induk):
  def _init_(self, x=0, y=0):
    super()._init_(x,y)
  def kali(x,y):
    return (x*y)
  def bagi(x,y):
    return (x/y)
  def mod(x,y):
    return (x%y)
jos = Anak(8,4)
print(f'tambah \t: {jos.tambah()}')
print(f'kurang \t: {jos.kurang()}')
print(f'kali \t: {jos.kali()}')
print(f'bagi \t: {jos.bagi()}')
print(f'mod \t: {jos.mod()}')