import { Service } from 'typedi';

import { PlaceRepository, ObjectInstanceRepository, RoleRepository } from '../../repositories';
import { Place, ObjectInstance } from '../../types/models';

/** Service for dealing with blocks */
@Service()
export class PlaceService {
  constructor(
    private placeRepository: PlaceRepository,
    private objectInstanceRepository: ObjectInstanceRepository,
    private roleRepository: RoleRepository,
  ) {}

  public async canAdmin(slug: string): Promise<any> {
    const placeRoleId = await this.findRoleIdsBySlug(slug);
    if (!placeRoleId) {
      console.log('Place roleId not found');
    } else {
      console.log(placeRoleId);
    }
    return;
  }
  
  public async findById(placeId: number): Promise<Place> {
    return await this.placeRepository.findById(placeId);
  }

  public async findBySlug(slug: string): Promise<Place> {
    return await this.placeRepository.findBySlug(slug);
  }

  public async getPlaceObjects(placeId: number): Promise<ObjectInstance[]> {
    return await this.objectInstanceRepository.findByPlaceId(placeId);
  }
  
  private async findRoleIdsBySlug(slug: string): Promise<any> {
    const roleId = {
      bank: {
        owner: await this.roleRepository.roleMap.BankManager,
        deputy: await this.roleRepository.roleMap.BankCashier,
      },
    };
    return roleId[slug];
  }
}
