# Token de acesso simples (Bearer) usado pela API — ver
# app/controllers/api/auth_controller.rb e app/controllers/api/base_controller.rb.
class Token < ApplicationRecord
  belongs_to :user

  before_validation { self.key = SecureRandom.hex(32) if key.blank? }

  validates :key, presence: true, uniqueness: true
end
