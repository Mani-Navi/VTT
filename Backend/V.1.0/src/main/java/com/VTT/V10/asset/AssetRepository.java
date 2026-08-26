package com.VTT.V10.asset;

import com.VTT.V10.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssetRepository extends JpaRepository<Asset, UUID> {
    List<Asset> findAllByUserOrderByCreatedAtDesc(User user);
    List<Asset> findAllByUserAndTypeOrderByCreatedAtDesc(User user, Asset.AssetType type);
    List<Asset> findAllByUserAndCollectionName(User user, String collectionName);
    List<Asset> findAllByUserAndFolderName(User user, String folderName);
}